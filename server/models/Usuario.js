const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    rol: { type: String, enum: ['admin'], default: 'admin' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
