const router = require('express').Router();
const passport = require('passport');
const user = require('../models/user');
const Asignatura = require('../models/asignatura');
const QRCode = require('qrcode');



router.get('/crear_user', (req, res, next) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador"){
    res.render('crear_user');
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/catalogo',
  failureRedirect: '/signin',
  failureFlash: true
})); 

router.get('/signin', (req, res, next) => {
  res.render('login');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/catalogo',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/users',isAuthenticated, async (req, res, next) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador")
      try {
        // Obtener todos los usuarios de la base de datos
        const users = await user.find();

        // Renderizar la vista con la lista de usuarios
        res.render('admin_profile', { users: users });
      } catch (error) {
        next(error);
      }
    else
      res.render('profile');
  } else {
    res.redirect('/');
  }
});

router.get('/profile',isAuthenticated, async (req, res, next) => {
  if (req.user!=null){

    const email= req.user.email; 
    const nombre= req.user.nombre;
    
    QRCode.toFile('./public/qr/qrcode'+ nombre +'.png', email, {
      color: {
        dark: '#000',  // Puntos negros
        light: '#0000' // Fondo transparente
      }
    }, function (err) {
      if (err) throw err
      console.log('¡Código QR generado exitosamente!');
    });

    res.render('profile',{qr: "/qr/qrcode"+ nombre +".png", user: req.user});

  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.get('/administrar', (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador")
      res.render('administrar');
      else
      res.render('profile');
  } else {
    res.redirect('/');
  }
});


router.get('/modificar_usuario', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador"){
      try {
        const users = await user.find();
        res.render('modificar_user', { users: users });
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        req.flash('error', 'Ha ocurrido un error al cargar los usuarios');
        res.redirect('/');
      }
    }else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

router.post('/modificar_usuario', async (req, res) => {
  const { user: userId, password, rol } = req.body;
  const newUser = new user();
  try {
    // Buscar el usuario por su ID
    const existingUser = await user.findById(userId);

    if (!existingUser) {
      req.flash('error', 'El usuario no existe');
      return res.redirect('/modificar_usuario');
    }

    // Modificar los datos del usuario
    if (password) {
      existingUser.password = newUser.encryptPassword(password);
    }
    if (rol) {
      existingUser.rol = rol;
      //Si se cambia a Administrador se elimina el usuario de las asignaturas
      if (existingUser.rol==="Administrador"){
        const asignaturas =await Asignatura.find();

        try {
  
          for (const asignatura of asignaturas) {
            asignatura.usuarios = asignatura.usuarios.filter(Id => Id.toString() !== userId.toString())
            await asignatura.save();
          }
    
        } catch (error) {
          console.error('Error al eliminar usuario de asignatura:', error);
          // Manejar el error
          res.redirect('/error');
        }
      }
    }

    


    await existingUser.save();

    req.flash('success', 'Usuario modificado correctamente');
    const users = await user.find();
    res.render('admin_profile', { users: users });
  } catch (error) {
    console.error('Error al modificar usuario:', error);
    req.flash('error', 'Ha ocurrido un error al modificar el usuario');
    res.redirect('/modificar_usuario');
  }
});

router.get('/delete_user', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador"){
      try {
        const users = await user.find();
        res.render('delete_user', { users });
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        req.flash('error', 'Ha ocurrido un error al cargar los usuarios');
        res.redirect('/');
      }
    } else {
      res.redirect('/prfile');
    }
  } else {
    res.redirect('/');
  }
});

router.post('/delete_user', isAuthenticated, async (req, res) => {
  try {
    const asignaturas =await Asignatura.find();
    const userId = req.body.userId;

    try {

      for (const asignatura of asignaturas) {
        asignatura.usuarios = asignatura.usuarios.filter(Id => Id.toString() !== userId.toString())
        await asignatura.save();
      }

    } catch (error) {
      console.error('Error al eliminar usuario de asignatura:', error);
      // Manejar el error
      res.redirect('/error');
    }


    await user.findByIdAndDelete(userId);
    req.flash('success', 'Usuario eliminado correctamente');
    // Redirigir al administrador a la página admin_profile.ejs
    res.redirect('/profile');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    req.flash('error', 'Ha ocurrido un error al eliminar el usuario');
    // En caso de error, redirigir también a la página admin_profile.ejs
    res.redirect('/profile');
  }
});




function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
};

module.exports = router;
