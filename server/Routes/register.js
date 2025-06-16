const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const express = require('express');
router.use(express.json());


router.post('/register',async(req,res) => {
    const {username,email,password} = req.body
    const hash = await bcrypt.hash(password, 10);

    if(!username || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
    }
    console.log('Looking for exsisting user with email:', email);
    const e  = await User.findOne({email});
        if(e) {
            return res.status(400).json({message: "User already exists"});
        } else {
            const newUser = new require('../models/User')({
                username,
                email,
                password: hash
            });

            try {
                const savedUser = await newUser.save();
                res.status(201).json({message: "User registered successfully", user: savedUser});
            } catch (error) {
                res.status(500).json({message: "Error registering user", error: error.message});
            }

        }
    
    })

module.exports = router