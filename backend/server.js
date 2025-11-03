
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const userRoutes = require('./routes/userRoutes');
const moduloRoutes = require('./routes/moduloRoutes.js');
const documentoRoutes = require('./routes/documentoRoutes.js');

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'Backend ejecutado' });
});

app.use('/api/users', userRoutes);
app.use('/api/modulos', moduloRoutes);
app.use('/api/documentos', documentoRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conexion exitosa');
    app.listen(PORT, () => {
      console.log(`servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error no se pudo conectar al Mongo:', error.message);
  });