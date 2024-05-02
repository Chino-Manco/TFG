const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Asignatura = require('../models/asignatura');
const User = require('../models/user');

const router = express.Router();

// Configuración de multer para almacenar archivos subidos
const upload = multer({ dest: 'uploads/' });

// Ruta para mostrar la página de importación de CSV
router.get('/importar_csv', (req, res) => {
  if (req.user && req.user.rol === "Administrador") {
    res.render('importar_csv');
  } else {
    res.redirect('/administrar');
  }
});

// Ruta para procesar el archivo CSV subido
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  const results = [];
  const errores = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        try {
          if (row.email) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(row.password, salt);

            const newUser = new User({
              email: row.email,
              password: hashedPassword,
              rol: row.rol
            });
            await newUser.save();
          } else if (row.nombre) {
            const newAsignatura = new Asignatura({
              nombre: row.nombre,
              descripcion: row.descripcion,
              grado: row.grado
            });
            await newAsignatura.save();
          }
        } catch (err) {
          errores.push({ error: err.message, row });
        }
      }

      fs.unlinkSync(req.file.path);

      res.json({
        success: errores.length === 0,
        message: errores.length === 0 ? 'Todos los datos han sido importados con éxito' : 'Algunos registros no se pudieron importar',
        errores: errores
      });
    })
    .on('error', (err) => {
      res.json({ success: false, message: 'Error al procesar el archivo CSV', error: err.message });
    });
});

module.exports = router;
