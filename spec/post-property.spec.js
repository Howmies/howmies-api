const dotenv = require('dotenv');
const request = require('request');
const jwt = require('jsonwebtoken');
const pool = require('../configs/elephantsql');
const app = require('../app');
const consoleLog = require('../utils/log-to-console');

// encapsulate server session

xdescribe('POST /auth/properties', () => {
  dotenv.config();

  process.env.NODE_ENV = 'test';

  const uri = `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}/auth/properties`;

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

  describe('without feature request', () => {
    const result = {};
    const postPropertiesRequest = {
      status: 'rent',
      phone: '',
      email: '',
      features: [],
      type: 'flat',
      state: 'Lagos',
      lga: 'Agege',
      address: 'No. 4, Suru Street, Agege-Ogba, Lagos.',
      price: 100000,
      period: 'monthly',
      description: 'A cozy comfort with good security and power suppply. Water runs well from the borehole.',
    };
    const options = {
      method: 'POST',
      headers: authenticationToken,
      body: postPropertiesRequest,
      json: true,
    };

    beforeEach((done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        result.propertyId = body.data.propertyId;
        done();
      });
    });

    afterEach(async (done) => {
      await pool.query(`DELETE FROM properties
      WHERE address='No. 4, Suru Street, Agege-Ogba, Lagos.';`)
        .then(() => done())
        .catch(() => done());
    });

    it('successfully posts property with response Status 200', () => {
      const expected = 201;
      expect(result.status).toBe(expected);
    });
  });
});
