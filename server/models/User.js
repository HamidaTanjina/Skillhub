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
    },

    // NEW FIELDS

    isOnline:{
        type:Boolean,
        default:false
    },

    rating:{
        type:Number,
        default:0
    },

    totalReviews:{
        type:Number,
        default:0
    },

    completedSwaps:{
        type:Number,
        default:0
    }

},{
    timestamps:true
});