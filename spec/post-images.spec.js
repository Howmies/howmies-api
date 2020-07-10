const dotenv = require('dotenv');
const request = require('request');
const jwt = require('jsonwebtoken');
const pool = require('../configs/elephantsql');
const app = require('../app');
const consoleLog = require('../utils/log-to-console');

// encapsulate server session

xdescribe('POST /auth/:property_id/images', () => {
  dotenv.config();

  process.env.NODE_ENV = 'test';

  const uri = `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}/auth/2/images`;

  // setup server

  const normalizePort = (val) => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }
    return false;
  };

  const port = normalizePort(process.env.PORT);

  let server;

  beforeAll((done) => {
    server = app
      .set('port', port)
      .listen(port, () => done());
  });

  afterAll((done) => {
    process.env.NODE_ENV = 'development';
    server.close(() => {
      done();
      consoleLog(
        '\x1b[42m\x1b[30m Finished user signup tests\x1b[0m\n',
      );
    });
  });

  const authenticationToken = {
    authorization: jwt.sign(
      {
        uid: 148,
        role: 'user',
        iat: (new Date()).valueOf(),
      },
      process.env.RSA_PRIVATE_KEY,
      { expiresIn: 900, algorithm: 'HS256' },
    ),
  };

  describe('with required credentials', () => {
    const result = {};
    const postImagesRequest = {
      images: ['http://res.cloudinary.com/daygucgkt/image/upload/v1583172280/howmies/properties/107/priosouercw1nuackdds.jpg'],
    };
    const options = {
      method: 'POST',
      headers: authenticationToken,
      body: postImagesRequest,
      json: true,
    };

    beforeEach((done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        done();
      });
    });

    afterEach(async (done) => {
      await pool.query(`DELETE FROM images WHERE
      image_url='http://res.cloudinary.com/daygucgkt/image/upload/v1583172280/howmies/properties/107/priosouercw1nuackdds.jpg';`)
        .then(() => done())
        .catch(() => done());
    });

    it('successfully posts images with response Status 200', () => {
      const expected = 201;
      expect(result.status).toBe(expected);
    });
  });
}).pend('Not figured out how to generate a long term token');
