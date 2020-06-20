/* eslint-disable no-console */

const dotenv = require('dotenv');
const request = require('request');
const app = require('../app');

dotenv.config();

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

const uri = `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}`;

let server;

describe('GET /api/v0.0.1', () => {
  beforeAll((done) => {
    server = app
      .set('port', port)
      .listen(port, () => done());
  });

  afterAll((done) => {
    server.close(() => {
      done();
      console.log(
        '\x1b[42m\x1b[30m', 'Finished API version tests\x1b[0m\n',
      );
    });
  });

  describe('development root url', () => {
    const result = {};
    const options = {
      method: 'GET',
      json: true,
    };

    beforeEach((done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        done();
      });
    });

    afterEach(() => {
      console.log('Test complete for API versioning');
    });

    it('responds with Status 200', () => {
      const expected = 200;
      expect(result.status).toBe(expected);
    });

    it('responds with Welcome message', () => {
      const expected = 'Welcome! Howmies';
      expect(result.message).toBe(expected);
    });
  });
});
