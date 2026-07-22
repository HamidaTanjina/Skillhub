const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name is required." });
        }
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        name = name.trim();
        email = email.toLowerCase().trim();

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isOnline: true,
            rating: 0,
            totalReviews: 0,
            completedSwaps: 0
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Registration Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        await User.findByIdAndUpdate(user._id, { $set: { isOnline: true } });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name || "SkillHub User",
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            { $set: { isOnline: false } }
        );

        res.json({
            message: "Logout Successful"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: error.message });
    }
};