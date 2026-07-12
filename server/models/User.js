const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    teachSkills:{
        type:[String],
        default:[]
    },

    learnSkills:{
        type:[String],
        default:[]
    },

    profilePicture:{
        type:String,
        default:""
    },
    bio:{
    type:String,
    default:""
},

location:{
    type:String,
    default:""
}

});

module.exports = mongoose.model("User", UserSchema);