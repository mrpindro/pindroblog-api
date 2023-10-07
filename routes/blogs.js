const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogsController');
const upload = require('../config/multer');
const verifyJWT = require('../middleware/verifyJWT');

// router.use(verifyJWT);

router.route('/')
    .get(blogsController.getAllBlogs)
    .post(upload.single('image'), blogsController.createBlog)
    .patch(upload.single('image'), blogsController.updateBlog)
    .delete(verifyJWT, blogsController.deleteBlog)
;

// router.route('/:id')
//     .patch(upload.single('image'), blogsController.updateBlog)
// ;

router.route('/user')
    .get(verifyJWT, blogsController.getBlogByUser)
;

module.exports = router;