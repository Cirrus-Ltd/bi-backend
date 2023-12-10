const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        min: 1,
        max: 16,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        default: "",
        max: 32
    },
    lastName: {
        type: String,
        required: true,
        default: "",
        max: 32
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_.+-]+@f-cirrus.co.jp/, 'ドメインはf-cirrus.co.jpである必要があります'],
        max: 319
    },
    password: {
        type: String,
        required: true,
        min: 1,
        max: 70
    },
    secretKey: {
        type: String,
        unique: true,
        default:""
    },
    confirmationToken: {
        type: String,
        unique: true,       
        sparse: true        
    },
    isVerified: {       
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        max: 20,
        default: "",
    },
    sex: {
        type: String,
        max: 8,
        default: "",
    },
    birthday: {
        type: Date,
        default: "",
    },
    desc: {
        type: String,
        max: 128,
        default: "",
    },
    city: {
        type: String,
        max: 50,
    },
},
{timestamps: true}
);
module.exports = mongoose.model("User",UserSchema);