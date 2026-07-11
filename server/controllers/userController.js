const User = require("../models/User");

exports.getProfile = async(req,res)=>{

    try{

        const user=await User.findById(req.user.id).select("-password");

        res.json(user);

    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

};
exports.saveSkills = async (req, res) => {

    try {

        const { teachSkills, learnSkills } = req.body;

        const user = await User.findByIdAndUpdate(

            req.user.id,

            {
                teachSkills,
                learnSkills
            },

            {
                new: true
            }

        );

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};