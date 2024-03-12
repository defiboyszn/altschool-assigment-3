const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  dob: Date
});

module.exports = mongoose.model('User', userSchema);
