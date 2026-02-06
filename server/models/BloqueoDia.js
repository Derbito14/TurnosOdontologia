const mongoose = require('mongoose');

const BloqueoDiaSchema = new mongoose.Schema({
    fecha: { type: Date, required: true, unique: true }, // Ensure one block per day or allow multiple? "Bloquear días completos" implies one entry covers the day.
    motivo: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BloqueoDia', BloqueoDiaSchema);
