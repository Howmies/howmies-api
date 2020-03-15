const request = require('request');
const { server, port, listen } = require('../server');

describe('Server', () => {
  let service;
  beforeAll((done) => {
    listen.close();
    service = server.listen(port);
    done();
  });
  afterAll((done) => {
    console.log('\x1b[42m\x1b[30m', 'Finished API avalability tests\x1b[0m\n');
    service.close();
    done();
  });

  describe('GET /', () => {
    const result = {};
    const uri = 'http://localhost:3000/api';

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
        console.log('Test complete for API availability');
        done();
      });
      it('responds with Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('responds with OK message', () => {
        const expected = 'OK! Howmies';
        expect(result.message).toBe(expected);
      });
    });
  });
});
