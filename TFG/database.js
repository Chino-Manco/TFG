const mongoose = require('mongoose');
const { mongodb } = require('./keys');

mongoose.set('useFindAndModify', false);
mongoose.connect(mongodb.URI, {
  useNewUrlParser: true, useUnifiedTopology: true 
})
mongoose.connect(mongodb.URI)
  .then(db => console.log('DB is connected'))
  .catch(err => console.log(err));