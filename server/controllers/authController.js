const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register

exports.registerUser = async(req,res)=>{

    try{

        const {name,email,password}=req.body;

        const userExists=await User.findOne({email});

        if(userExists){
            return res.status(400).json({
                message:"User already exists"
            });
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const user=await User.create({
            name,
            email,
            password:hashedPassword
        });

        res.status(201).json({
            message:"Registration Successful"
        });

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

// Login

exports.loginUser=async(req,res)=>{

    try{

        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(!user){

            return res.status(400).json({
                message:"User not found"
            });

        }

        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch){

            return res.status(400).json({
                message:"Wrong password"
            });

        }

        const token=jwt.sign(
            {
                id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );

        res.json({
            message:"Login Successful",
            token
        });

    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};
