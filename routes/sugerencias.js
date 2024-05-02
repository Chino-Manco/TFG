const router = require('express').Router();
const Sugerencia = require('../models/sugerencia');

// Ruta para mostrar el formulario de sugerencia
router.get('/sug', (req, res) => {
    res.render('sug'); 
});

// Ruta para mostrar el buzon de sugerencias
router.get('/buzon', async (req, res) => {
    try {
        const sugerencias = await Sugerencia.find();
        res.render('buzon', { sugerencias: sugerencias });
    } catch (error) {
        console.error('Error al obtener las sugerencias:', error);
        req.flash('error', 'Ha ocurrido un error al obtener las sugerencias');
        res.redirect('/');
    }
});


// Ruta para procesar el formulario de sugerencia
router.post('/crear-sugerencia', async (req, res) => {
    try {
        // Crear una nueva sugerencia con los datos del formulario
        const nuevaSugerencia = new Sugerencia({
            titulo: req.body.titulo,
            cuerpo: req.body.cuerpo
        });

        // Guardar la sugerencia en la base de datos
        await nuevaSugerencia.save();

        // Redirigir de vuelta a la página sug.ejs
        res.redirect('/sug');
    } catch (error) {
        console.error('Error al crear la sugerencia:', error);
        // Manejar el error
        res.redirect('/error'); // Redirigir a una página de error si ocurre un error
    }
});


// Ruta para eliminar una sugerencia por su ID
router.delete('/sugerencia/:id', async (req, res) => {
    const sugerenciaId = req.params.id;
    try {
        // Eliminar la sugerencia de la base de datos por su ID
        await Sugerencia.findByIdAndDelete(sugerenciaId);
        res.sendStatus(200); // Enviar estado OK si la eliminación fue exitosa
    } catch (error) {
        console.error('Error al borrar la sugerencia:', error);
        res.sendStatus(500); // Enviar estado de error si ocurre algún problema
    }
});

module.exports = router;