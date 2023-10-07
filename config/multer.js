const multer = require('multer');

// const storage = multer.diskStorage({
//     filename: function(req, file, callback) {
//         callback(null, Date.now() + file.originalname);
//     }
// });

const storage = new multer.memoryStorage()

const imageFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return cb(new Error("Only image files are accepted!"), false);
    }

    cb(null, true);
}

const upload = multer({storage: storage, fileFilter: imageFilter});

module.exports = upload;