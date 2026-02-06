const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Turno = require('../models/Turno');
const BloqueoDia = require('../models/BloqueoDia');

// GET /api/admin/turns (Get all turns, optional filter by date)
router.get('/turns', auth, async (req, res) => {
    try {
        // Simple fetch all (or add filters later)
        // Ideally filter by range start/end
        const turns = await Turno.find().sort({ fecha: 1 });
        res.json(turns);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/turns/:id (Update status)
router.put('/turns/:id', auth, async (req, res) => {
    const { estado } = req.body; // 'confirmado', 'rechazado', 'cancelado'
    try {
        let turno = await Turno.findById(req.params.id);
        if (!turno) return res.status(404).json({ msg: 'Turno not found' });

        turno.estado = estado;
        await turno.save();

        // TODO: Trigger WhatsApp notification here if approved

        res.json(turno);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST /api/admin/blocks (Block a day)
router.post('/blocks', auth, async (req, res) => {
    const { fecha, motivo } = req.body;
    try {
        const newBlock = new BloqueoDia({
            fecha: new Date(fecha),
            motivo
        });
        await newBlock.save();
        res.json(newBlock);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/blocks (Get all blocked days)
router.get('/blocks', auth, async (req, res) => {
    try {
        const blocks = await BloqueoDia.find().sort({ fecha: 1 });
        res.json(blocks);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
