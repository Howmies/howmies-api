const request = require('request');
const pool = require('../elephantsql');
const { server, port, listen } = require('../server');

describe('Server', () => {
  let service;
  beforeAll((done) => {
    listen.close();
    service = server.listen(port);
    done();
  });
  afterAll((done) => {
    console.log('\x1b[42m\x1b[30m', 'Finished post-properties unit tests\x1b[0m\n');
    service.close();
    done();
  });

  describe('POST /properties', () => {
    const result = {};
    const uri = 'http://localhost:3000/api/v1/properties';
    let postPropertiesRequest;

    describe('with all data in correct format', () => {
      postPropertiesRequest = {};
      const options = {
        method: 'POST',
        body: postPropertiesRequest,
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
        pool.query('delete from properties where email=$1', ['testuseremail@howmies.com'], (err) => {
          if (err) { return console.log(`Error deleting from database - ${err.message}`); }
          console.log('Test complete for fully correct data format');
          done();
        });
      });
      it('successfully signs up user with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('successfully signs up user with success response message', () => {
        const expected = 'Successfully signed up';
        expect(result.message).toBe(expected);
      });
    });
  });
});
