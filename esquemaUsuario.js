const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  clave: { type: String, required: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);