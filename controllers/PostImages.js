const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { dataURI } = require('../middleware/file_upload/multerConfig');
const pool = require('../elephantsql');
const { cloudinaryConfig, uploader } = require('../middleware/file_upload/cloudinaryConfig');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

cloudinaryConfig();

exports.postImages = async (req, res) => {
  // verify session
  const user = await jwt.verify(
    req.headers.authorization,
    process.env.RSA_PRIVATE_KEY,
    { algorithms: ['HS256'] },
    (err, result) => {
      if (err) {
        return console.log({
          status: err.name,
          message: err.message,
        });
      }

      const expiration = Math.floor(result.exp - Date.now() / 1000);

      if (expiration < 1) console.log(`Expired session at ${expiration}s ago`);
      else {
        console.log(`Session until ${expiration}s`);
        return result;
      }
    },
  );

  if (!user || !user.role || !user.uid) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid session access',
    });
  }

  const { uid, role } = user;

  if (role !== 'user') {
    return res.status(403).send({
      status: 'Error',
      message: 'Unauthorized request. Login or Sign up to continue.',
    });
  }

  // verify user
  const ownerID = await pool.query('SELECT user_id FROM users WHERE user_id=$1', [uid])
    .then((result) => result.rows[0].user_id)
    .catch((err) => console.log(err));

  if (!ownerID) {
    return res.status(403).send({
      status: 'Error',
      message: 'Could not validate user. Login or Sign up to continue.',
    });
  }

  // verify images
  if (req.imagesError) {
    console.log(`Error: Multer upload error: ${req.imagesError.message}`);
    return res.status(403).send({
      status: 'Error',
      message: 'Ensure your images are jpg, jpeg or png',
    });
  }

  // verify database image count
  const pID = req.params.pid;
  const images = req.files;

  const imgCount = await pool.query(
    'SELECT COUNT(property_id) FROM images WHERE property_id=$1',
    [pID],
  )
    .then((result) => parseInt(result.rows[0].count, 10))
    .catch((err) => console.log(err));

  if (!imgCount) {
    return res.status(500).send({});
  }

  if (imgCount + images.length > 10) {
    return res.status(400).send({
      status: 'Warning',
      message: 'You have exceeded the images limit. Maximum of 10',
    });
  }

  // to Cloudinary

  const imgPromise = await images.map(async (image) => {
    const imageBody = dataURI(image).content;
    try {
      const result = await uploader.upload(imageBody, {
        folder: `howmies/properties/${pID}`,
        format: 'jpg',
      });
      return result.url;
    } catch (err) {
      console.log(err);
    }
  });

  const imgURLs = await Promise.all(imgPromise).catch((err) => console.log(err));

  if (!imgURLs) {
    return res.status(500).send({
      status: 'Error',
      message: 'Error uploading file',
    });
  }

  // insert image URLs to database
  const insertArr = (imgURLs.length > 0) ? () => {
    let text = '';
    for (let i = 0; i < imgURLs.length; i += 1) {
      if (i === imgURLs.length - 1) {
        text += `('${imgURLs[i]}', ${pID})`;
      } else {
        text += `('${imgURLs[i]}', ${pID}), `;
      }
    }
    return text;
  } : null;

  const savedImgs = (insertArr) ? await pool.query(
    `INSERT INTO images(image_url, property_id)
      VALUES${insertArr()}
    RETURNING *;`,
  )
    .then((result) => result.rows)
    .catch((err) => console.log(`Error: Error inserting feature id: ${err}`))
    : null;

  if (savedImgs && savedImgs.length > 0) {
    res.status(200).send({
      status: 'Success',
      message: 'Image upload succesful',
      data: savedImgs,
    });
  } else {
    res.status(500).send({
      status: 'Error',
      message: 'No images for this post',
    });
  }
};
