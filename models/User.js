const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    image: {
        type: String,
    },
    imageId: String,
    active: {
        type: Boolean,
        default: true
    },
    roles: {type: [String], default: ["User"]}
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;