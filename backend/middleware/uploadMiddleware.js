const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|txt|md/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Basic mime check
    const mimetype = file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' || file.mimetype === 'text/markdown';

    if (extname || mimetype) { // relaxed check
        return cb(null, true);
    } else {
        cb('Error: Documents Only!');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;
