const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await Usuario.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '12h' }, // Session lasts 12 hours
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/register-initial (Helper to create the first admin manually if needed, or dev only)
// REMOVE IN PRODUCTION or protect heavily
router.post('/register-dev', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        let user = await Usuario.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new Usuario({ nombre, email, passwordHash: password });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);

        await user.save();
        res.send('Admin created');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
