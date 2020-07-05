const dotenv = require('dotenv');
const request = require('request');
const app = require('../app');
const consoleLog = require('../utils/log-to-console');
const { deleteByEmail } = require('../models/users-model');

// encapsulate server session

describe('POST /auth/users/signup', () => {
  dotenv.config();

  process.env.NODE_ENV = 'test';

  const uri = `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}/users/signup`;

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

  // setup tests

  describe('with all required data', () => {
    const result = {};

    const reqBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john_doe@howmies.com',
      phone: '+2348012345678',
      password: 'howmiesAPIv1',
      confirmPassword: 'howmiesAPIv1',
    };

    const options = {
      method: 'POST',
      body: reqBody,
      json: true,
    };

    beforeEach(async (done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        done();
      });
    });

    afterEach(async (done) => {
      try {
        await deleteByEmail('john_doe@howmies.com');
        done();
        consoleLog('Test complete for user signup');
      } catch (error) {
        done();
      }
    });

    it('responds with Status 201', () => {
      const expected = 201;
      expect(result.status).toBe(expected);
    });
  });

  describe('without confirming password', () => {
    const result = {};

    const reqBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john_doe@howmies.com',
      phone: '+2348012345678',
      password: 'howmiesAPIv1',
    };

    const options = {
      method: 'POST',
      body: reqBody,
      json: true,
    };

    beforeEach(async (done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        done();
      });
    });

    afterEach(async (done) => {
      try {
        await deleteByEmail('john_doe@howmies.com');
        done();
        consoleLog('Test complete for user signup without confirming password');
      } catch (error) {
        done();
      }
    });

    it('responds with Status 422', () => {
      const expected = 422;
      expect(result.status).toBe(expected);
    });
  });

  describe('without phone number', () => {
    const result = {};

    const reqBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john_doe@howmies.com',
      phone: '',
      password: 'howmiesAPIv1',
      confirmPassword: 'howmiesAPIv1',
    };

    const options = {
      method: 'POST',
      body: reqBody,
      json: true,
    };

    beforeEach(async (done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        done();
      });
    });

    afterEach(async (done) => {
      try {
        await deleteByEmail('john_doe@howmies.com');
        done();
        consoleLog('Test complete for user signup without phone number');
      } catch (error) {
        done();
      }
    });

    it('responds with Status 422', () => {
      const expected = 422;
      expect(result.status).toBe(expected);
    });
  });
});
