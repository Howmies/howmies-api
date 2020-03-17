const dotenv = require('dotenv');
const { dataURI } = require('../middleware/file_upload/multerConfig');
const pool = require('../elephantsql');
const { cloudinaryConfig, uploader } = require('../middleware/file_upload/cloudinaryConfig');
const sessionValidator = require('../middleware/SessionValidator');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

cloudinaryConfig();

module.exports = async (req, res) => {
  // verify session
  const tokenVerifier = sessionValidator(
    req.headers.authorization,
    process.env.RSA_PRIVATE_KEY,
    'user',
  );

  if (tokenVerifier && tokenVerifier.expiration) {
    return res.status(401).send({
      status: 'Expired',
      message: tokenVerifier.expiration,
    });
  }

  if ((tokenVerifier && tokenVerifier.error)
    || (tokenVerifier && !tokenVerifier.user)) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid session access',
    });
  }

  // verify images
  if (req.imagesError) {
    return res.status(403).send({
      status: 'Error',
      message: 'Ensure your images are jpg, jpeg or png',
    });
  }

  // verify database image count
  const pID = req.params.pid;
  const images = req.files;

  const imageCount = await pool.query(
    'SELECT COUNT(property_id) FROM images WHERE property_id=$1',
    [parseInt(pID, 10)],
  )
    .then((result) => result.rows[0].count)
    .catch(() => null);

  if (!imageCount) {
    return res.status(500).send({
      status: 'Error',
      message: 'Internal server error',
    });
  }

  if (imageCount + images.length > 10) {
    return res.status(400).send({
      status: 'Warning',
      message: 'You have exceeded the images limit. Maximum of 10',
    });
  }

  // to Cloudinary
  const imagePromise = await images.map(async (image) => {
    const imageBody = dataURI(image).content;
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

  const imageURLs = await Promise.all(imagePromise).catch(() => null);

  if (!imageURLs) {
    return res.status(500).send({
      status: 'Error',
      message: 'Error uploading file',
    });
  }

  // insert image URLs to database
  const insertArr = (imageURLs.length > 0) ? () => {
    let text = '';
    for (let i = 0; i < imageURLs.length; i += 1) {
      if (i === imageURLs.length - 1) {
        text += `('${imageURLs[i]}', ${pID})`;
      } else {
        text += `('${imageURLs[i]}', ${pID}), `;
      }
    }
    return text;
  } : null;

  const savedImages = (insertArr) ? await pool.query(
    `INSERT INTO images(image_url, property_id)
      VALUES${insertArr()}
    RETURNING *;`,
  )
    .then((result) => result.rows)
    .catch(() => null)
    : null;

  if (savedImages && savedImages.length > 0) {
    res.status(200).send({
      status: 'Success',
      message: 'Image upload succesful',
      data: savedImages,
    });
  } else {
    res.status(500).send({
      status: 'Error',
      message: 'No images for this post',
    });
  }
};
