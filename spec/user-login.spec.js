const dotenv = require('dotenv');
const request = require('request');
const app = require('../app');
const consoleLog = require('../utils/log-to-console');

// encapsulate server session

describe('POST /users/login', () => {
  dotenv.config();

  process.env.NODE_ENV = 'test';

  const uri = `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}/users/login`;

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

  beforeAll(async (done) => {
    server = app
      .set('port', port)
      .listen(port, () => done());
  });

  afterAll((done) => {
    process.env.NODE_ENV = 'development';
    server.close(() => {
      done();
      consoleLog(
        '\x1b[42m\x1b[30m Finished user login tests\x1b[0m\n',
      );
    });
  });

  describe('with all data in correct format', () => {
    const result = {};
    const userLoginRequest = {
      email: 'bahdcoder@gmail.com',
      password: 'Password-1234',
    };

    const options = {
      method: 'POST',
      body: userLoginRequest,
      json: true,
    };

    beforeEach((done) => {
      request(uri, options, (error, response, body) => {
        result.status = response.statusCode;
        result.message = body.message;
        done();
      });
    });

    afterEach((done) => {
      consoleLog('Test complete for fully correct data format');
      done();
    });

    it('successfully logs user in with response Status 200', () => {
      const expected = 200;
      expect(result.status).toBe(expected);
    });
  });
});
