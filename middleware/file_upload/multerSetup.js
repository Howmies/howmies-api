const multer = require('multer');

const storage = multer.memoryStorage();
const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    callback(null, true);
  } else {
    req.imageValidationError = {
      name: 'error',
      message: 'Only non-gif images allowed',
    };
    callback({ message: 'Unsupported file format' }, false);
  }
};

const limits = { fileSize: 1000000 };

exports.multerUploads = multer({
  storage,
  fileFilter,
  limits,
}).array('images', 10);
