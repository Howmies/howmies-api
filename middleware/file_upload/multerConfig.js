const multer = require('multer');
const DataURI = require('datauri');
const path = require('path');

const dataURI = new DataURI();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (mimetype === 'image/jpeg'
    || mimetype === 'image/png'
    || mimetype === 'image/gif') {
    cb(null, true);
  } else {
    req.imagesError = {
      name: 'Error',
      message: 'Unsupported file format\nEnsure your images are jpg, jpeg, png or gif',
    };
    cb(null, false);
  }
};

const limits = { fileSize: 1024 * 1024 };

exports.multerUpload = multer({
  storage,
  fileFilter,
  limits,
}).array('images', 10);

exports.dataURI = (image) => dataURI.format(
  path.extname(image.originalname).toString(),
  image.buffer,
);
