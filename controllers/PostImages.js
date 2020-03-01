const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const pool = require('../elephantsql');
const { cloudinaryConfig, uploader } = require('../middleware/file_upload/cloudinaryConfig');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

cloudinaryConfig();

exports.postProperty = async (req, response) => {
  // verify session
  const user = await jwt.verify(
    req.headers.authorization,
    process.env.RSA_PRIVATE_KEY,
    { algorithms: ['HS256'] },
    (err, result) => {
      if (err) {
        console.log({
          status: err.name,
          message: err.message,
        });
        return;
      }
      const expiration = (Math.floor(result.exp / 1000) + (60 * 15))
        - Math.floor(Date.now() / 1000);
      if (expiration < 1) {
        console.log({
          status: 'tokenExpError',
          message: `Expired session at ${expiration}s ago`,
        });
      } else {
        console.log({
          uid: result.uid,
          exp: `Session until ${expiration}s`,
        });
        return result;
      }
    },
  );

  if (!user || !user.uid || !user.role) {
    return response.status(403).send({
      status: 'Error',
      message: 'Invalid session access',
    });
  }

  const { uid } = user;
  const { role } = user;

  if (role !== 'user') {
    return response.status(403).send({
      status: 'Error',
      message: 'Unauthorized request. Login or Sign up to continue.',
    });
  }

  // verify user
  const ownerID = await pool.query('SELECT user_id FROM users WHERE user_id=$1', [uid])
    .then((result) => result.rows[0].user_id)
    .catch((err) => console.log(err));

  if (!ownerID) {
    return response.status(403).send({
      status: 'Error',
      message: 'Could not validate user. Login or Sign up to continue.',
    });
  }

  // verify images
  if (req.imagesError) {
    console.log(req.imagesError);
  }

  if (!req.files) {
    console.log('Ensure your images are jpg, jpeg or png');
    return response.status(403).send({
      status: 'Error',
      message: 'Ensure your images are jpg, jpeg or png',
    });
  }

  // save property images
  const pID = req.params.property_id;
  const images = req.files;
  let imgURLs = [];
  let uploadErr = [];
  let savedImgs = [];

  // to Cloudinary
  images.forEach((image) => {
    uploader.upload(image, {
      folder: 'Howmies/Properties',
      format: 'jpg',
    })
      .then((result) => {
        imgURLs.push(result.url);
      })
      .catch((err) => {
        uploadErr.push(err);
      });
  });

  if (uploadErr.length > 0) {
    console.log(uploadErr[0]);
    return response.status(500).send({
      status: 'Error',
      message: 'Error uploading file',
    });
  }

  uploadErr = [];

  // to database
  imgURLs.forEach((imgURL) => {
    pool.query(
      'INSERT INTO images(image_url, property_id) VALUES($1, $2)',
      [imgURL, pID],
    )
      .then((result) => {
        savedImgs.push(result.rows[0].image_url);
      })
      .catch((err) => {
        uploadErr.push(err.message);
      });
  });

  if (uploadErr.length > 0) {
    console.log(uploadErr);
    return response.status(500).send({
      status: 'Error',
      message: 'Internal server file error',
    });
  }

  uploadErr = [];

  if (savedImgs.length > 0) {
    console.log(savedImgs);
    response.status(500).send({
      status: 'Success',
      message: savedImgs,
    });
  }

  imgURLs = [];
  savedImgs = [];
};
