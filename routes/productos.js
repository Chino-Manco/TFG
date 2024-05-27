const router = require('express').Router();
const Producto = require('../models/producto');
const User = require('../models/user');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const app = express();
const path = require('path');

router.use(express.urlencoded({ extended: true }));

// Configuración de Multer para almacenar archivos en la carpeta "uploads"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads'); // Ruta donde se almacenarán los archivos
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Nombre de archivo original
    }
});
const upload = multer({ storage: storage });





router.get('/', (req, res, next) => {
    res.redirect('/catalogo');
});

router.get('/escanearCliente', (req, res, next) => {
    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Cliente")
            res.redirect('/');
        else {
            res.render('escanearCliente');
        }
    }
});

router.post('/escanearCliente', async (req, res, next) => {

    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Cliente")
            res.redirect('/');
        else {
            const dni = req.body.dni;
            if (dni){
                const productosV= await Producto.find();
                const cliente= await User.findOne({dni: dni});
                
                if (cliente)
                    res.render('vender', {cliente, productosV});
                else 
                    res.redirect('/vender')
        
            } else {
                res.redirect('/vender')
            }
        }
    }
});

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



router.get('/catalogo', async (req, res, next) => {
    const productos = await Producto.find().sort({ categoria: 1, nombre: 1 });
    res.render('catalogo', {productos});
});

router.get('/catalogo/:nombre', async (req, res, next) => {
    const nombre= req.params.nombre;
    const productos = await Producto.find({nombre: new RegExp(nombre, 'i')}).sort({ categoria: 1, nombre: 1 });
    res.render('catalogo', {productos});
});



router.get('/informacion/:codigoBarra', async (req, res, next) => {
    const codigoBarra= req.params.codigoBarra;
    const producto= await Producto.findOne({ codigoBarra: codigoBarra });
    res.render('informacion', {producto});
});


router.post('/informacionEditada', upload.single('imagen'),  async (req, res, next) => {

    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Cliente")
            res.redirect('/');
        else {

            const codigo = req.body.codigo;
            const stock = req.body.stock;
            const modifyProduct= await Producto.findOne({codigoBarra: codigo});
            modifyProduct.stock=stock;
        
            if (req.user.rol==="Administrador"){
        
                const nombre = req.body.nombre;
                const precio = req.body.precio;
                const categoria = req.body.categoria;
                const peso = req.body.peso;
                const ingredientes = req.body.ingredientes;
                const nutricional = req.body.nutricional;
        
                modifyProduct.nombre=nombre;
                modifyProduct.precio=precio;
                modifyProduct.categoria=categoria;
                modifyProduct.peso=peso;
                modifyProduct.precio=precio;
                modifyProduct.ingredientes=ingredientes;
                modifyProduct.valorNutricional=nutricional;
        
                if (req.file) {
                    fs.unlink("public" +modifyProduct.imagen, async (err) => {
                        if (err) {
                            console.error('Error al eliminar la foto:', err);
                        }
                        console.log('Foto eliminada:', modifyProduct.imagen);
                        modifyProduct.imagen='/uploads/'+ req.file.filename;
                        await modifyProduct.save();
                    });
                } else  {
                    await modifyProduct.save();
                }
            } else {
                await modifyProduct.save();
            }
        
            res.redirect('/informacion/'+modifyProduct.codigoBarra);
        }
    }
});

// Ruta para mostrar el formulario de producto
router.get('/subirProducto', async (req, res) => {
    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Administrador"){    
            const categorias = await Producto.distinct('categoria').sort();
            const productMessage = req.query.productMessage || "";
            res.render('subirProducto', { categorias, productMessage});
        }
        else {
            res.redirect('/');
        }
    }
});


// Ruta para procesar el formulario de producto
router.post('/subirProducto', upload.single('imagen'), async (req, res) => {

    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Administrador"){
            try {



                var encontrado= false;
                var categoria=req.body.categoria;
                const codigoBarra=req.body.codigoBarra;
                const nombre=req.body.name;
        
                const productos= await Producto.find();
        
                for (const producto of productos){
                    if (producto.codigoBarra===codigoBarra || producto.nombre===nombre)
                        encontrado=true;
                }
        
        
                if (encontrado===false){
        
                    if (categoria==="Input"){
                        categoria=req.body.nuevaCategoria;
                    }
                    
                    // Crear una nueva producto con los datos del formulario
                    const nuevoProducto = new Producto({
                        codigoBarra: codigoBarra,
                        nombre: nombre,
                        categoria: categoria.toUpperCase(),
                        peso: req.body.peso,
                        precio: req.body.precio,
                        ingredientes: req.body.ingredientes,
                        valorNutricional: req.body.valorNutricional,
                        imagen: '/uploads/'+ req.file.filename,
                        stock:req.body.stock
                    });
        
        
                    // Guardar el producto en la base de datos
                    await nuevoProducto.save();
        
                    // Redirigir de vuelta a la página sug.ejs
                    res.redirect('/catalogo');
                } else {
                    res.redirect('/subirProducto?productMessage=Codigo de barra o nombre ya registrado');
                }
        
            } catch (error) {
                console.error('Error al crear el producto:', error);
                // Manejar el error
                res.redirect('/error'); // Redirigir a una página de error si ocurre un error
            }
        }
        else {
            res.redirect('/');
        }
    }
});


// Ruta para eliminar una producto por su ID
router.post('/eliminarProducto', async (req, res) => {

    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Administrador"){
            const productoId = req.body.id;
            const producto= await Producto.findById(productoId);
        
            fs.unlink("public" +producto.imagen, async (err) => {
                if (err) {
                    console.error('Error al eliminar la foto:', err);
                }
            });
            try {
                // Eliminar la producto de la base de datos por su ID
                await Producto.findByIdAndDelete(productoId);
                res.redirect("/catalogo");
            } catch (error) {
                console.error('Error al borrar la producto:', error);
                res.sendStatus(500); // Enviar estado de error si ocurre algún problema
            }
        }
        else {
            res.redirect('/');
        }
    }
});

module.exports = router;