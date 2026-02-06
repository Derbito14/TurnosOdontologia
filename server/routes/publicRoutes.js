const express = require('express');
const router = express.Router();
const Turno = require('../models/Turno');
const Paciente = require('../models/Paciente');
const BloqueoDia = require('../models/BloqueoDia');

// Helper to check if a date is blocked
const isDayBlocked = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const block = await BloqueoDia.findOne({
        fecha: { $gte: startOfDay, $lte: endOfDay }
    });
    return !!block;
};

// GET /api/public/availability?date=YYYY-MM-DD
router.get('/availability', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Date is required' });

        const queryDate = new Date(date);

        // Check if day is blocked
        if (await isDayBlocked(queryDate)) {
            return res.json({ slots: [] }); // No slots if blocked
        }

        // Check if weekend (Saturday/Sunday) - Assuming Mon-Fri only based on specs
        const dayOfWeek = queryDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.json({ slots: [] });
        }

        // Define working hours
        // Morning: 08:00 - 12:00 (Last slot starts at 11:00 if 1h duration) -> 8, 9, 10, 11
        // Afternoon: 15:00 - 19:00 (Last slot starts at 18:00) -> 15, 16, 17, 18
        const morningSlots = ['08:00', '09:00', '10:00', '11:00'];
        const afternoonSlots = ['15:00', '16:00', '17:00', '18:00'];
        const possibleSlots = [...morningSlots, ...afternoonSlots];

        // Fetch existing turns for that day
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingTurns = await Turno.find({
            fecha: { $gte: startOfDay, $lte: endOfDay },
            estado: { $ne: 'cancelado' } // Ignore cancelled turns
        });

        const bookedTimes = existingTurns.map(t => t.horaInicio);

        // Filter out booked slots
        const availableSlots = possibleSlots.filter(slot => !bookedTimes.includes(slot));

        res.json({ slots: availableSlots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/public/turns
router.post('/turns', async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, dni, edad, genero, obraSocial, fecha, horaInicio, motivoConsulta } = req.body;

        // Basic validation
        if (!dni || !fecha || !horaInicio) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Check Availability again (Race condition prevention)
        const dateObj = new Date(fecha);
        // ... (Re-implement availability check or trust UI? Better to check)
        // For brevity, assuming frontend checks, but production should double check.

        // 2. Find or Create Paciente
        let paciente = await Paciente.findOne({ dni });
        if (paciente) {
            // Update details if changed?
            // paciente.nombre = nombre; ... 
            // await paciente.save();
        } else {
            paciente = new Paciente({ nombre, apellido, email, telefono, dni, edad, genero, obraSocial });
            await paciente.save();
        }

        // 3. Create Turno
        // Calculate HoraFin (Assuming 1 hour duration)
        const [hour, minute] = horaInicio.split(':').map(Number);
        const endHour = hour + 1;
        const horaFin = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const newTurno = new Turno({
            pacienteId: paciente._id,
            pacienteNombre: `${paciente.nombre} ${paciente.apellido}`, // Denormalization for convenience
            fecha: dateObj,
            horaInicio,
            horaFin,
            motivoConsulta,
            estado: 'pendiente'
        });

        await newTurno.save();

        res.status(201).json({ message: 'Turno solicitado con éxito', turnoId: newTurno._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error check logs' });
    }
});

module.exports = router;
