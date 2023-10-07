const User = require('../models/User');
const Blog = require('../models/Blog');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary');

// @desc Get all users 
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found'})
    }
    res.json(users);
})

// @desc Create new user 
// @route POST /users
// @access Private
const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const duplicate = await User.findOne({ username })
        .collation({ locale: 'en', strength: 2 }).lean().exec()
    ;

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataUri = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataUri, {folder: 'users-image'});
    const userObject = { 
        username, email, "password": hashedPwd, 
        image: result.secure_url, imageId: result.public_id
    };

    // Create and store new user 
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: `New user '${username}' created`});
    } else {
        res.status(400).json({ message: 'Invalid user data received'});
    }
})

// @desc Update user 
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, active, password } = req.body;

    // confirm data 
    if (!username || !email || !active) {
        return res.status(400).json({ message: 'All fields are required'});
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // check for duplicate 
    const duplicate = await User.findOne({ username })
        .collation({ locale: 'en', strength: 2 }).lean().exec()
    ;

    // and allow update to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    // delete former profile image from cloudinary 
    await cloudinary.uploader.destroy(user.imageId, (result) => console.log(result));

    // then upload the new image 
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataUri = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataUri, {folder: 'users-image'});

    user.username = username;
    user.email = email;
    user.image = result.secure_url;
    user.active = active;

    if (password) {
        // hash password
        user.password = await bcrypt.hash(password, 10); // salt rounds
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.username} updated` });
})

// @desc Delete user 
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }
    

    // Does the user exist to delete?
    const user = await User.findById(id).exec();

    const userBlogs = await Blog.find({user});
    await Blog.find({user}).deleteMany({user: user});

    userBlogs.map(async blog => {
        await cloudinary.uploader.destroy(blog.imageId, (result) => console.log(result))
    })

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // await blog.deleteOne();
    const result = await user.deleteOne();

    await cloudinary.uploader.destroy(
        user.imageId, (result) => console.log(result)
    );

    const reply = `Username '${result.username}' with ID '${result._id}' deleted`;

    res.json(reply);
})

module.exports = { getAllUsers, createUser, updateUser, deleteUser };