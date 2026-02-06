const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true }, // Unique removed to allow same email for diff patients if needed? Or keep unique? Requirement says "Registro completo". Email usually unique.
    telefono: { type: String, required: true },
    dni: { type: String, required: true, unique: true },
    edad: { type: Number, required: true },
    genero: { type: String },
    obraSocial: { type: String, enum: ['OSDE', 'OMINT', 'APROSS', 'PARTICULAR'], default: 'PARTICULAR' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paciente', PacienteSchema);
