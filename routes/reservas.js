const router = require('express').Router();
const User = require('../models/user');
const Reserva = require('../models/reserva');
const express = require('express');
const app = express();

router.get('/reservar', async (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`; // Fecha en formato 'yyyy-mm-dd'
    
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const hora = `${hours}:${minutes}`; // Hora en formato 'HH:MM'
    
        const reservasParaEliminar = await Reserva.find({ fecha: { $ne: new Date(formattedDate) } });
    
        const reservas= await Reserva.find({fecha: new Date (formattedDate)}).sort({ hora: 1 });
        for (const borrar of reservasParaEliminar){
            await Reserva.findByIdAndDelete(borrar._id);
        }
        const clientes = [];
        const ids= [];
        for (const reserva of reservas) {
            const cliente = await User.findById(reserva.cliente);
            if (!ids.includes(cliente._id.toString())){
                ids.push(cliente._id.toString());
                clientes.push(cliente);
            }
        }
        res.render('reservar', {reservas, hora, clientes});
    }
});

router.post('/reservar', async (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else {
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
    }
});

router.post('/eliminarReserva', async (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else {
        await Reserva.findByIdAndDelete(req.body._id);
        res.redirect('/profile');
    }
});

module.exports = router;