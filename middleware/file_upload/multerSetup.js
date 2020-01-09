const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.memoryStorage();

exports.multerUploads = [
  multer({
    storage,
    limits: { fileSize: 5000000 },
    fileFilter: (req, file, callback) => {
      if (file.originalname.split('.')[1] !== 'jpg'
        && file.originalname.split('.')[1] !== 'jpeg'
        && file.originalname.split('.')[1] !== 'png'
        && file.originalname.split('.')[1] !== 'JPG'
        && file.originalname.split('.')[1] !== 'JPEG'
        && file.originalname.split('.')[1] !== 'PNG') {
        req.fileValidationError = {
          name: 'error',
          message: 'Only non-gif images allowed',
        };
      }
      return callback(null, true);
    },
  }).array('images', 10),
  multer({ storage }).single('type'),
];
