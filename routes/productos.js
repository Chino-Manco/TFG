const router = require('express').Router();
const producto = require('../models/producto');
const Producto = require('../models/producto');

// Ruta para mostrar el formulario de producto
router.get('/subirProducto', async (req, res) => {

    const categorias = await Producto.distinct('categoria').sort();
    const productMessage = req.query.productMessage || "";


    res.render('subirProducto', { categorias, productMessage}); 
});

// Ruta para procesar el formulario de producto
router.post('/subirProducto', async (req, res) => {
    try {

        var encontrado= false;
        var categoria=req.body.categoria;
        const codigoBarra=req.body.codigoBarra;
        const nombre=req.body.name;

        const productos= await Producto.find();

        for (const producto of productos){
            if (producto.codigoBarra===codigoBarra || producto.nombre===nombre)
                encontrado=true;
            console.log(encontrado);
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
                valorNutricional: req.body.valorNutricional
            });


            // Guardar la producto en la base de datos
            await nuevoProducto.save();

            // Redirigir de vuelta a la página sug.ejs
            res.redirect('/subirProducto');
        } else {
            res.redirect('/subirProducto?productMessage=Codigo de barra o nombre ya registrado');
        }

    } catch (error) {
        console.error('Error al crear el producto:', error);
        // Manejar el error
        res.redirect('/error'); // Redirigir a una página de error si ocurre un error
    }
});

// Ruta para mostrar el buzon de productos
router.get('/buzon', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.render('buzon', { productos: productos });
    } catch (error) {
        console.error('Error al obtener las productos:', error);
        req.flash('error', 'Ha ocurrido un error al obtener las productos');
        res.redirect('/');
    }
});





// Ruta para eliminar una producto por su ID
router.delete('/producto/:id', async (req, res) => {
    const productoId = req.params.id;
    try {
        // Eliminar la producto de la base de datos por su ID
        await Producto.findByIdAndDelete(productoId);
        res.sendStatus(200); // Enviar estado OK si la eliminación fue exitosa
    } catch (error) {
        console.error('Error al borrar la producto:', error);
        res.sendStatus(500); // Enviar estado de error si ocurre algún problema
    }
});

module.exports = router;