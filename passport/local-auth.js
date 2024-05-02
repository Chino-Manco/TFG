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
  const {rol} = req.body;
  var user = new User();
   user = await user.findEmail( email)
  if(user) {
    return done(null, false, req.flash('signupMessage', 'Email ya registrado anteriormente.'));
  } else {
    const newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.rol= rol;
    await newUser.insert();
    done(null, req.user);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
   user = await user.findEmail( email);
  if(!user|| !user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Credenciales incorrectas.'));
  }
  return done(null, user);
}));
