const router = require('express').Router();
const User = require('../models/user');
const Venta = require('../models/venta');
const Producto = require('../models/producto');
const express = require('express');
const app = express();

router.post('/vender', async (req, res, next) => {
    
    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Cliente")
            res.redirect('/');
        else {
            const codigos= req.body.codigo;
            const productos=[];
            const cantidades= req.body.cantidad;
            const dni = req.body.dni;
            const cliente= await User.findOne({dni:dni});
            const user= req.user;
            const fechaHora=new Date();
            const total= req.body.total;
            let n=0;

            

            for (const codigo of codigos){
                const p= await Producto.findOne({codigoBarra: codigo});
                productos.push(p);
                p.stock-=cantidades[n];
                if (p.stock<0)
                    p.stock=0;
                n++;
                await p.save();
            };

            const venta = new Venta();

            venta.fechaHora=fechaHora;
            venta.cliente=cliente;
            venta.empleado=user;
            venta.productos=productos;
            venta.cantidades=cantidades;
            venta.total=total;

            await venta.save();

            res.redirect('/catalogo');
        }
    }
});

router.get('/ticket/:id', async (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else{
        const id= req.params.id;
        const venta= await Venta.findById(id);

        const productos = [];
        for (const ids of venta.productos){
            const producto= await Producto.findById(ids);
            productos.push(producto);
        }
        
        if (venta.cliente!==null){
            const cliente= await User.findById(venta.cliente);
            res.render('venta', {venta, cliente, productos});
        } else 
            res.render('venta', {venta, productos});
    }
});

router.get('/listaVentas', async (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Administrador"){
            const ventas= await Venta.find().sort({ fechaHora: -1 });
            res.render('listaVentas', {ventas});
        } else 
            res.redirect('/');
    }
});

module.exports = router;