const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const checkDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        console.error('Database connection check failed. ReadyState:', mongoose.connection.readyState);
        res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
        return false;
    }
    return true;
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!checkDbConnection(res)) return;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!checkDbConnection(res)) return;

    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

module.exports = { registerUser, loginUser };
