const pageSize = 20; // Número de productos por página

router.get('/catalogo/:page', async (req, res, next) => {
    const currentPage = parseInt(req.params.page) || 1;
    const skip = (currentPage - 1) * pageSize;
    const totalProducts = await Producto.countDocuments();
    const totalPages = Math.ceil(totalProducts / pageSize);

    const productos = await Producto.find({})
        .skip(skip)
        .limit(pageSize)
        .sort({ categoria: 1, stock: 1, nombre: 1 });

    res.render('catalogo', { productos, currentPage, totalPages });
});
