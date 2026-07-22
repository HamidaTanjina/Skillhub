const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// Register User
// =======================
exports.registerUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // 1. Explicit Check for Required Inputs
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name is required." });
        }
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Normalize inputs
        name = name.trim();
        email = email.toLowerCase().trim();

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isOnline: true,
            rating: 0,
            totalReviews: 0,
            completedSwaps: 0
        });

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        // 6. Send response
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

// =======================
// Login User
// =======================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // 1. Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // 3. Update Online Status atomically (Prevents whole-document validation crashes)
        await User.findByIdAndUpdate(user._id, { $set: { isOnline: true } });

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        // 5. Send response
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

// =======================
// Logout User
// =======================
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