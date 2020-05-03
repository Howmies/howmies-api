const request = require('request');
const { port, server } = require('../server');

const version = 'v0.0.1';

describe('Server', () => {
  beforeAll((done) => {
    server.close();
    server.listen(port);
    done();
  });
  afterAll((done) => {
    console.log('\x1b[42m\x1b[30m', 'Finished API version availability tests\x1b[0m\n');
    server.close();
    done();
  });

  describe('GET /', () => {
    const result = {};
    const uri = `http://localhost:${port}/api/${version}/`;

    describe('development root url', () => {
      const options = {
        method: 'GET',
        json: true,
      };

      beforeAll((done) => {
        request(uri, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
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
