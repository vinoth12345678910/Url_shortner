require('dotenv').config(); // Load environment variables from .env file

const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const express = require('express');



router.post('/login', async (req, res) => {
    const {email,password}= req.body;
    if(!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
     try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({message: "Login successful", token});
    } catch (error) {
        res.status(500).json({message: "Error logging in", error: error.message});
    }
})

module.exports = router