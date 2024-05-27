const router = require('express').Router();
const User = require('../models/user');
const Venta = require('../models/venta');
const Producto = require('../models/producto');
const express = require('express');
const app = express();

//Renderiza la pagina de vender con todos los productos que hay en la base de datos con la intencion de guardarlo en un hidden input
router.get('/vender', async (req, res, next) => {

    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Cliente")
            res.redirect('/');
        else {
            const productosV = await Producto.find();
            res.render('vender', {productosV});
        }
    }
});

//Guarda todos los datos de compra ademas de reducir el stock correspondiente
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

            
            //Reduce el Stock
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

//Renderiza los datos de su respectiva compra
router.get('/ticket/:id', async (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else{
        const id= req.params.id;
        const venta= await Venta.findById(id);

        if (req.user._id.toString()===venta.cliente.toString() ||
        req.user._id.toString()===venta.empleado.toString()){
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
        } else {
            res.redirect('/');
        }
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