let express= require('express');
const router = express.Router();
const passport = require('passport');
const user = require('../models/user');
const Reserva = require('../models/reserva');
const Producto = require('../models/producto');
const Venta = require('../models/venta');
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
  if (!req.user)
    res.render('login');
  else
    res.redirect('/'); 
});

//Renderiza la pagina de validar junto con la lista de Users que no sean administrador
router.get('/validar', async (req, res, next) => {
  if (!req.user)
    res.redirect('/');
  else {
    if (req.user.rol==="Administrador"){

      const users= await user.find({ rol: { $ne: "Administrador" } }).sort({ email: 1});
      res.render('validar', {users});

    } else {
      res.redirect('/');
    }
  }
});

//Actualiza cada user con su nuevo rol
router.post('/validar', async (req, res, next) => {
  if (!req.user)
    res.redirect('/');
  else{
    if (req.user.rol==="Administrador"){
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
    }
    else {
      res.redirect('/');
    }
  }
});

router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/catalogo',
  failureRedirect: '/signin',
  failureFlash: true
}));

//Muestra la pagina del perfil del usuario con sus compras o ventas y los clientes ademas las reservas de pan
router.get('/profile',isAuthenticated, async (req, res, next) => {
  if (req.user!=null){
    let reservas = [];
    let ventas = [];
    let hora="";
    if (req.user.rol==="Cliente"){

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`; // Fecha en formato 'yyyy-mm-dd'
  
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      hora = `${hours}:${minutes}`; // Hora en formato 'HH:MM'
      
      reservas = await Reserva.find({ 
        fecha: new Date(formattedDate), 
        cliente: req.user._id 
      }).sort({ hora: 1 });


      ventas= await Venta.find({cliente: req.user._id}).sort({ fechaHora: -1 });
    }else 
      ventas= await Venta.find({empleado: req.user._id}).sort({ fechaHora: -1 });

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

    res.render('profile',{qr: "/qr/qrcode"+ dni +".png", user: req.user, reservas, hora, ventas});

  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

//Ruta para actualizar los datos del usuario a excepcion del email y dni
router.post('/editarUser', async (req, res) => {
  if (!req.user)
    res.redirect('/');
  else{
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
  }
});

//Ruta para eliminar usuario
router.post('/eliminarUser', isAuthenticated, async (req, res) => {
  if (!req.user)
    res.redirect('/');
  else{
    try {
      const userId = req.body.userId;
      const dni= req.user.dni;


      //Borra el QR del usuario primero antes de eliminar el user
      fs.unlink("public/qr/qrcode"+ dni +".png", async (err) => {});


      const reservas= await Reserva.find({cliente: userId});
      for (const reserva of reservas){
        await Reserva.findByIdAndDelete(reserva._id);
      }

      await user.findByIdAndDelete(userId);
      res.redirect('/logout');

    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      req.flash('error', 'Ha ocurrido un error al eliminar el usuario');
      // En caso de error, redirigir también a la página admin_profile.ejs
      res.redirect('/profile');
    }
  }
});




function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
};

module.exports = router;
