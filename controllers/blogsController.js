const Blog = require('../models/Blog');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    if (!blogs?.length) {
        return res.status(404).json({ message: "No content found" })
    } 

    // Add username to each note before sending the response
    // See promise.all with map() here: https://youtu.be/41qJBBEpjRE
    // You could also do this with a for... of loop
    const blogsWithUser = await Promise.all(blogs.map(async (blog) => {
        const user = await User.findById(blog.user).lean().exec();
        return { ...blog, creator: user?.username }
    }));

    res.status(200).json(blogsWithUser);
})

const createBlog = asyncHandler(async (req, res) => {
    const { user, title, content } = req.body;

    if (!user || !title || !content) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataUri = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataUri, {folder: 'blog-images'});

    const newBlog = await Blog.create({ 
        user, title, content, image: result.secure_url, imageId: result.public_id
    });

    if (newBlog) {
        return res.status(201).json({ message: "New blog created" });
    } else {
        return res.status(400).json({ message: "Invalid blog data received" });
    }
})

const updateBlog = asyncHandler(async (req, res) => {
    const { id, user, title, content } = req.body;
    // const { id } = req.params;

    if (!user || !title || !content) {
        return res.status(400).json({ message: "All fields required" })
    }

    // Confirm blog exists to update
    const blog = await Blog.findById(id).exec();

    if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
    }

    // // delete former blog image from cloudinary
    // await cloudinary.uploader.destroy(blog.imageId, { folder: 'blog-images' });

    // // then upload the new image 
    // const b64 = Buffer.from(req.file.buffer).toString('base64');
    // let dataUri = "data:" + req.file.mimetype + ";base64," + b64;
    // const result = await cloudinary.uploader.upload(dataUri, {folder: 'blog-images'});


    blog.user = user;
    blog.title = title;
    blog.content = content;
    // blog.image = result.secure_url;
    // blog.imageId = result.public_id;

    const updatedBlog = await blog.save();

    res.json(`'${updatedBlog.title}' updated`)
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Blog ID required' })
    }

    const blog = await Blog.findById(id).exec();

    if (!blog) {
        res.status(404).json({ message: "Blog not found" });
    }

    const result = await blog.deleteOne();
    await cloudinary.uploader.destroy(blog.imageId, (result) => console.log(result));

    const reply = `Blog '${result.title}' with ID ${result._id} deleted`;

    res.json(reply);
});

const getBlogByUser = asyncHandler(async (req, res) => {
    const {user} = req.body;

    const userBlogs = await Blog.find({user}).lean();
    const creator = await User.findById(user).exec();
    // const userBlogsWithUser = await Promise.all(userBlogs.map(async (blog) => {
    //     const creator = await User.findById(blog);
    //     return {...userBlogs, creator: creator?.username}
    // }))

    res.status(200).json({...userBlogs, creator: creator.username});
})

module.exports = {getAllBlogs, createBlog, updateBlog, deleteBlog, getBlogByUser};