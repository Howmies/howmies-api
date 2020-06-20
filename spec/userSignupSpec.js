/* eslint-disable no-console */

const dotenv = require('dotenv');
const request = require('request');
const app = require('../app');
const { deleteByEmail } = require('../models/users-model');

dotenv.config();

const uri = `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}/auth/users/signup`;

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

// encapsulate server session

describe('POST /auth/users/signup', () => {
  beforeAll((done) => {
    server = app
      .set('port', port)
      .listen(port, () => done());
  });

  afterAll((done) => {
    server.close(() => {
      done();
      console.log(
        '\x1b[42m\x1b[30m', 'Finished user signup tests\x1b[0m\n',
      );
    });
  });

  // setup tests

  describe('with all required data', () => {
    const result = {};

    const reqBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@howmies.test',
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
        await deleteByEmail('user@howmies.test');
        done();
        console.log('Test complete for user signup');
      } catch (error) {
        done();
      }
    });

    it('responds with Status 200', () => {
      const expected = 200;
      expect(result.status).toBe(expected);
    });
  });

  describe('without confirming password', () => {
    const result = {};

    const reqBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@howmies.test',
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
      done();
      console.log('Test complete for user signup without confirming password');
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
      email: 'user@howmies.test',
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
      done();
      console.log('Test complete for user signup without phone number');
    });

    it('responds with Status 422', () => {
      const expected = 422;
      expect(result.status).toBe(expected);
    });
  });
});
