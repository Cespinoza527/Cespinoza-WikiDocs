const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/authMiddleware.js');
const Version = require('../models/Version.js');
const Documento = require('../models/Documento.js');
const Auditoria = require('../models/Auditoria.js');
const Modulo = require('../models/Modulo.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const almacenamiento = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'archivos/');
  },
  filename(req, file, cb) {
    cb(null, `version-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const subida = multer({ storage: almacenamiento });

router.post('/', proteger, subida.single('archivo'), async (req, res) => {
  try {
    const { documentoId, contenido, comentario } = req.body;
    let rutaArchivo = null;

    if (req.file) {
      const { path: rutaTemporal, mimetype: tipoArchivo } = req.file;
      const fileContent = fs.readFileSync(rutaTemporal);
      const nombreArchivoS3 = `versiones/${Date.now()}-${path.basename(req.file.originalname)}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: nombreArchivoS3,
        Body: fileContent,
        ContentType: tipoArchivo,
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
      rutaArchivo = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${nombreArchivoS3}`;

      try {
        fs.unlinkSync(rutaTemporal);
      } catch (err) {
        console.error("No se pudo borrar el archivo temporal:", err);
      }

      await Documento.findByIdAndUpdate(documentoId, { rutaArchivo: rutaArchivo });
    }

    if (!documentoId || (!contenido && !rutaArchivo)) {
      return res.status(400).json({ message: 'Faltan datos (documentoId o contenido/archivo)' });
    }

    if (!comentario || comentario.trim() === '') {
      return res.status(400).json({ message: 'El comentario es obligatorio para crear una nueva versión.' });
    }

    const nuevaVersion = new Version({
      documento: documentoId,
      contenido: contenido,
      rutaArchivo: rutaArchivo,
      comentario: comentario,
      user: req.user._id
    });

    const versionGuardada = await nuevaVersion.save();
    const docInfo = await Documento.findById(documentoId).populate('modulo');
    const nombreModulo = docInfo && docInfo.modulo ? docInfo.modulo.nombre : 'Desconocido';
    const tituloDoc = docInfo ? docInfo.titulo : 'Desconocido';

    const auditoria = new Auditoria({
      accion: 'ACTUALIZACIÓN',
      usuario: req.user._id,
      detalles: `Nueva versión de: "${tituloDoc}" en módulo "${nombreModulo}". Comentario: "${comentario}"`
    });
    await auditoria.save();

    res.status(201).json(versionGuardada);

  } catch (error) {
    console.error('Error al guardar la versión:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

router.get('/latest/:documentoId', proteger, async (req, res) => {
  try {
    const { documentoId } = req.params;

    const versiones = await Version.find({
      documento: documentoId
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!versiones || versiones.length === 0) {
      return res.status(404).json({ message: 'No se encontraron versiones para este documento' });
    }

    const ultimaVersion = versiones[0];

    res.json(ultimaVersion);

  } catch (error) {
    console.error('Error al obtener la última versión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/history/:documentoId', proteger, async (req, res) => {
  try {
    const { documentoId } = req.params;
    const versiones = await Version.find({ documento: documentoId })
      .sort({ createdAt: -1 })
      .populate('user', 'nombre');

    res.json(versiones);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;