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
      cb(null, Date.now()+ path.extname(file.originalname)); // Nombre de archivo original
    }
});
const upload = multer({ storage: storage });



router.get('/', (req, res, next) => {
    res.redirect('/catalogo');
});

//Muestra la pantalla en la que se debe escanear al cliente justo antes de la compra
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

//Comprueba si existe dni registrado y envia el objeto del cliente a la pantalla de vender
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


router.get('/restock', async (req, res, next) => {
    res.render('restock');
});

router.post('/restock', async (req, res, next) => {

    const codigoBarra= req.body.codigo;
    const producto= await Producto.findOne({ codigoBarra: codigoBarra });
    if (producto){
        producto.stock += parseInt(req.body.stock, 10);
        await producto.save();
        const correct= "Stock guardado con éxito"
        res.render('restock', {correct});
    } else {
        const error="Código no registrado"
        res.render('restock', {error});
    }
});


//Renderiza el catalogo con todos los productos
// Ruta para el catálogo con paginación
router.get('/catalogo', async (req, res, next) => {
    const page = parseInt(req.query.page) || 1; // Página actual, por defecto 1
    const pageSize = 20; // Tamaño de la página, ajusta según sea necesario

    const totalProductos = await Producto.countDocuments(); // Total de productos
    const totalPages = Math.ceil(totalProductos / pageSize); // Total de páginas

    const productos = await Producto.find()
        .sort({ categoria: 1, nombre: 1 })
        .skip((page - 1) * pageSize) // Saltar los productos de las páginas anteriores
        .limit(pageSize); // Limitar el número de productos por página

    res.render('catalogo', {
        productos,
        currentPage: page,
        totalPages
    });
});


// Función para normalizar y eliminar diacríticos
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

router.get('/catalogo/:nombre/:page?', async (req, res, next) => {
    const nombreBuscado = req.params.nombre;
    const pageSize = 20; // Número de productos por página
    const currentPage = parseInt(req.params.page) || 1;
    const skip = (currentPage - 1) * pageSize;

    try {
        // Encuentra todos los productos
        const allProductos = await Producto.find();

        // Normaliza el nombre y la categoría de cada producto
        const productosNormalizados = allProductos.map(producto => {
            return {
                ...producto.toObject(), // Convertir el documento Mongoose a objeto para manipulación
                nombreNormalizado: normalizeString(producto.nombre),
                categoriaNormalizada: normalizeString(producto.categoria)
            };
        });

        // Normaliza el nombre buscado
        const normalizedNombreBuscado = normalizeString(nombreBuscado);

        // Filtra los productos normalizados que coinciden con el nombre buscado
        const productosFiltrados = productosNormalizados.filter(producto => {
            return (
                producto.categoriaNormalizada.includes(normalizedNombreBuscado) ||
                producto.nombreNormalizado.includes(normalizedNombreBuscado) ||
                producto.codigoBarra.includes(normalizedNombreBuscado) // Asumiendo que el campo código de barras es una cadena
            );
        });

        const totalProductos = productosFiltrados.length;
        const totalPages = Math.ceil(totalProductos / pageSize);
        const productosPaginados = productosFiltrados.slice(skip, skip + pageSize);

        res.render('catalogo', { productos: productosPaginados, nombreBuscado, currentPage, totalPages });
    } catch (error) {
        console.error('Error al buscar y normalizar productos:', error);
        res.status(500).send('Error en el servidor al buscar productos');
    }
});




//Renderiza la pagina de informacion con los detalles del producto seleccionado
router.get('/informacion/:codigoBarra', async (req, res, next) => {
    const codigoBarra= req.params.codigoBarra;
    const producto= await Producto.findOne({ codigoBarra: codigoBarra });
    res.render('informacion', {producto});
});

//Actualiza la nueva informacion proporcionada del producto
router.post('/informacionEditada', upload.single('imagen'),  async (req, res, next) => {

    if (!req.user)
        res.redirect('/');
    else{
        if (req.user.rol==="Cliente")
            res.redirect('/');
        else {
            //Solo se puede modificar el Stock siendo empleado
            const codigo = req.body.codigo;
            const stock = req.body.stock;
            const modifyProduct= await Producto.findOne({codigoBarra: codigo});
            modifyProduct.stock=stock;
        
            //El administrador puede actualizar todos los datos menos el codigo de barra
            if (req.user.rol==="Administrador"){
        
                const nombre = req.body.nombre;
                const precio = req.body.precio;
                const categoria = req.body.categoria;
                const peso = req.body.peso;
                const ingredientes = req.body.ingredientes;
                const nutricional = req.body.nutricional;
        
                modifyProduct.nombre=nombre;
                modifyProduct.precio=precio;
                modifyProduct.categoria=categoria.toUpperCase();
                modifyProduct.peso=peso;
                modifyProduct.precio=precio;
                modifyProduct.ingredientes=ingredientes
                modifyProduct.valorNutricional=nutricional;
        
                //Elimina la antigua imagen del producto en caso de que se actualice tambien
                if (req.file) {
                    fs.unlink("public"+modifyProduct.imagen, async (err) => {
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

// Ruta para mostrar el formulario de creacion de nuevo producto
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


// Guarda el nuevo producto
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

                //Busca si hay alguna coincidencia en el codigo de barras con un producto ya registrado
                for (const producto of productos){
                    if (producto.codigoBarra===codigoBarra || producto.nombre===nombre)
                        encontrado=true;
                }
        
                //Si no hay coincidencia procede a guardar el nuevo producto, en caso contrario lo reenvia de vuelta a la pagina con un mensaje de error
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