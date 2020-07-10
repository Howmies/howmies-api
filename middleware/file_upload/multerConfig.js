const multer = require('multer');
const DataURI = require('datauri');
const path = require('path');

const dataURI = new DataURI();

const storage = multer.memoryStorage();

const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (mimeTypes.includes(mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const limits = { fileSize: 1024 * 1024 };

const multerUpload = multer({
  storage,
  fileFilter,
  limits,
}).array('images', 10);

const dataUri = (image) => dataURI.format(
  path.extname(image.originalname).toString(),
  image.buffer,
);

module.exports = { multerUpload, dataUri };
