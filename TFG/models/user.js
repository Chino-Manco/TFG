const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { Schema } = mongoose;

const userSchema = new Schema({
  email:  { type: String, required: true },
  password:  { type: String, required: true },
  rol: { type: String, required: true },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  dni: { type: String, required: true },
  edad: { type: Number, required: false, min:0, decimal: false, default:0 }
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
userSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.findEmail= async (email) => {
  const User = mongoose.model("user", userSchema);
  return  await User.findOne({'email': email})
};


userSchema.methods.insert= async function () {
  //await this.save();
  await this.save((err, res) => {
    err ? console.log(err) : "";
    console.log("saved: " + res);
  });
};
module.exports = mongoose.model('user', userSchema);
