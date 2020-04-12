const request = require('request');
const jwt = require('jsonwebtoken');
const path = require('path');
const pool = require('../middleware/configs/elephantsql');
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
    let authenticationToken;
    let images;

    describe('without feature request', () => {
      images = [
        path.resolve(__dirname, './images/inec-logo1.gif'),
        path.resolve(__dirname, './images/wine-colors-excerpt.jpg'),
      ];
      postPropertiesRequest = {
        type: 'house',
        state: 'testState',
        lga: 'testLGA',
        address: 'testPropertyAddress',
        price: 1000,
        period: 'Monthly',
        description: 'testPropertyDescription',
        images,
      };
      authenticationToken = {
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
      const options = {
        method: 'POST',
        headers: authenticationToken,
        body: [postPropertiesRequest, images],
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
        pool.query('delete from properties where state=$1', ['testPropertyState'], (err) => {
          if (err) { return console.log(`Error deleting from database - ${err.message}`); }
          console.log('Test complete for fully correct data format');
          done();
        });
      });
      it('successfully posts property with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('successfully posts property with success response message', () => {
        const expected = 'Checking for point of error';
        expect(result.message).toBe(expected);
      });
    });
  });
});
