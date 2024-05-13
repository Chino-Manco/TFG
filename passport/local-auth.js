const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const rol = "Cliente";
  const nombre = req.body.nombre;
  const apellidos = req.body.apellidos;
  const edad = req.body.edad;
  const dni = req.body.dni;
  var user = new User();
  user = await user.findEmail(email);
  if(user) {
    return done(null, false, req.flash('signupMessage', 'Email ya registrado anteriormente.'));
  } else {
    const newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.rol = rol;
    newUser.nombre = nombre;
    newUser.apellidos = apellidos;
    newUser.edad = edad;
    newUser.dni = dni;
    await newUser.insert();
    done(null, newUser);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'lemail',
  passwordField: 'lpassword',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
   user = await user.findEmail( email);
  if(!user|| !user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Credenciales incorrectas.'));
  }
  return done(null, user);
}));
