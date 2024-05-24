let express= require('express');
const router = express.Router();
const passport = require('passport');
const user = require('../models/user');
const Reserva = require('../models/reserva');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/catalogo',
  failureRedirect: '/signin',
  failureFlash: true
})); 

router.get('/signin', (req, res, next) => {
  res.render('login');
});

router.get('/validar', async (req, res, next) => {
  const users= await user.find().sort({ email: 1});
  res.render('validar', {users});
});

router.post('/validar', async (req, res, next) => {
  const { clientes, empleados } = req.body;
  const clientesEmails = JSON.parse(clientes);
  const empleadosEmails = JSON.parse(empleados);

  const users= await user.find();


  for (const user of users){
      if(empleadosEmails.includes(user.email)){
          user.rol='Empleado';
          await user.save();
      }
      else if(clientesEmails.includes(user.email)){
          user.rol='Cliente';
          await user.save();
      }
  }

  res.redirect('/catalogo');
});

router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/catalogo',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/profile',isAuthenticated, async (req, res, next) => {
  if (req.user!=null){
    let reservas = [];
    if (req.user.rol==="Cliente"){

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`; // Fecha en formato 'yyyy-mm-dd'
  
      reservas = await Reserva.find({ 
        fecha: new Date(formattedDate), 
        cliente: req.user._id 
      }).sort({ hora: 1 });
    }


    const dni= req.user.dni;
    
    QRCode.toFile('./public/qr/qrcode'+ dni +'.png', dni, {
      color: {
        dark: '#000',  // Puntos negros
        light: '#0000' // Fondo transparente
      }
    }, function (err) {
      if (err) throw err
      console.log('¡Código QR generado exitosamente!');
    });

    res.render('profile',{qr: "/qr/qrcode"+ dni +".png", user: req.user, reservas});

  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.post('/editarUser', async (req, res) => {
  const email = req.body.email;

  try {
    const editUser= await user.findOne({email : email});

    if (!editUser) {
      req.flash('error', 'El usuario no existe');
      return res.redirect('/catalogo');
    }else {
      editUser.nombre=req.body.nombre;
      editUser.apellidos=req.body.apellidos;
      editUser.edad=req.body.edad;

      await editUser.save();
    }

    res.redirect('/profile');
  } catch (error) {
    console.error('Error al modificar usuario:', error);
    req.flash('error', 'Ha ocurrido un error al modificar el usuario');
    res.redirect('/catalogo');
  }
});

router.post('/eliminarUser', isAuthenticated, async (req, res) => {

  try {
    const userId = req.body.userId;
    const dni= req.user.dni;


    //borrar QR
    fs.unlink("public/qr/qrcode"+ dni +".png", async (err) => {});
    await user.findByIdAndDelete(userId);
    res.redirect('/logout');

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
