const router = require('express').Router();
const User = require('../models/user');
const Reserva = require('../models/reserva');
const express = require('express');
const app = express();

router.get('/reservar', async (req, res, next) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`; // Fecha en formato 'yyyy-mm-dd'

    const reservas= await Reserva.find({fecha: new Date (formattedDate)});
    res.render('reservar', {reservas});
});

router.post('/reservar', async (req, res, next) => {
    const user= req.user;
    const cantidad= req.body.cantidad;
    const hora= req.body.hora;
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    const formattedDate = `${yyyy}-${mm}-${dd}`; // Fecha en formato 'yyyy-mm-dd'
    
    const reserva = new Reserva({
        fecha: new Date(formattedDate),
        hora: hora,
        cliente: user,
        cantidad: cantidad
    });
    
    await reserva.save();
    res.redirect('/catalogo');
});

router.post('/eliminarReserva', async (req, res, next) => {
    await Reserva.findByIdAndDelete(req.body._id);
    res.redirect('/profile');
});

module.exports = router;