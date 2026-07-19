const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// Register User
// =======================

exports.registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({

            name,
            email,
            password: hashedPassword,

            isOnline: true,
            rating: 0,
            totalReviews: 0,
            completedSwaps: 0

        });

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Send response
        res.status(201).json({
            message: "Registration Successful",
            token
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// =======================
// Login User
// =======================

exports.loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                message: "User not found"
            });

        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(400).json({
                message: "Wrong password"
            });

        }

        // Update Online Status
        user.isOnline = true;
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Send response
        res.json({
            message: "Login Successful",
            token
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// =======================
// Logout User
// =======================

exports.logoutUser = async (req, res) => {

    try {

        await User.findByIdAndUpdate(
            req.user.id,
            {
                isOnline: false
            }
        );

        res.json({
            message: "Logout Successful"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};