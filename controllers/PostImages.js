const dotenv = require('dotenv');
const { validationResult } = require('express-validator');
const { dataUri } = require('../middleware/file_upload/multerConfig');
const { cloudinaryConfig, uploader } = require('../middleware/file_upload/cloudinaryConfig');
const ImagesModel = require('../models/images-model');
const sessionValidator = require('../utils/session-validator');
const errorHandler = require('../utils/error-handler');

dotenv.config();

cloudinaryConfig();

module.exports = async (req, res) => {
  // verify session

  try {
    await sessionValidator(
      req.headers.authorization,
      process.env.RSA_PRIVATE_KEY,
      'user',
    );
  } catch (err) {
    errorHandler(req, res, 403);
  }

  // verify images
  if (req.imagesError) {
    return errorHandler(req, res, 400, 'Ensure your images are jpg, jpeg or png');
  }

  // verify property ID in URL
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }

  // verify at least one accepted file

  const pID = req.params.property_id;
  const images = req.files;

  if (!images || (Array.isArray(images) && images.length < 1)) {
    return errorHandler(req, res, 400, 'Ensure your images are jpg, jpeg or png');
  }

  // verify image count for the property in database

  const imageModel = new ImagesModel(pID);

  let imageCount;

  try {
    imageCount = await imageModel.getImageCount();
  } catch (err) {
    return errorHandler(req, res);
  }

  if (imageCount + images.length > 10) {
    return errorHandler(
      req, res, 400, `Images limit exceeded. Only ${10 - imageCount} slots available`,
    );
  }

  // upload images to Cloudinary

  const imagePromise = await images.map(async (image) => {
    const imageBody = dataUri(image).content;
    try {
      const result = await uploader.upload(imageBody, {
        folder: `howmies/properties/${pID}`,
        format: 'jpg',
      });
      return result.url;
    } catch (err) {
      return null;
    }
  });

  // save images to database

  let uploadError;

  Promise
    .all(imagePromise)
    .then((result) => {
      imageModel.create(result, pID)
        .catch(() => errorHandler(req, res));
    })
    .catch(() => {
      uploadError = {
        error: () => errorHandler(req, res, 500, 'Images could not be uploaded'),
      };
    });

  if (uploadError && uploadError.error) {
    return uploadError.error();
  }

  return res.status(201).send({
    message: 'Images uploaded succesfully',
  });
};
