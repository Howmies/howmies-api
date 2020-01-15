const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const mimeType = file.originalname.split('.')[1];
  if (
    mimeType === 'jpg'
    || mimeType === 'jpeg'
    || mimeType === 'png'
    || mimeType === 'JPG'
    || mimeType === 'JPEG'
    || mimeType === 'PNG'
  ) {
    callback(null, true);
  } else {
    req.imagesError = {
      name: 'Error',
      message: 'Unsupported file format',
    };
    callback(null, false);
  }
};

const limits = { fileSize: 1000000 };

exports.multerUploads = multer({
  storage,
  fileFilter,
  limits,
}).array('images', 10);
