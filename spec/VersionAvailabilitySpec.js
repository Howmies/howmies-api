/* eslint-disable no-console */

const dotenv = require('dotenv');
const request = require('request');
require('../server');

dotenv.config();

const version = 'v0.0.1';

describe('Server', () => {
  afterAll(() => {
    console.log('\x1b[42m\x1b[30m', 'Finished API version availability tests\x1b[0m\n');
  });

  describe('GET /', () => {
    const result = {};
    const uri = `http://localhost:${process.env.PORT}/api/${version}/`;

    describe('development root url', () => {
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
      afterEach((done) => {
        console.log('Test complete for API version availability');
        done();
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
});
