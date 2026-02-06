const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
    pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    pacienteNombre: { type: String }, // Denormalized for easier display or just rely on populate? Keeping ref is better.
    fecha: { type: Date, required: true }, // Stores the date part 
    horaInicio: { type: String, required: true }, // "09:00"
    horaFin: { type: String, required: true }, // "10:00"
    estado: {
        type: String,
        enum: ['pendiente', 'confirmado', 'realizado', 'cancelado', 'ausente', 'rechazado'],
        default: 'pendiente'
    },
    motivoConsulta: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Turno', TurnoSchema);
