const request = require('request');
const pool = require('../middleware/database/elephantsqlConfig');
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

    describe('without feature request', () => {
      postPropertiesRequest = {
        type: 'house',
        state: 'testState',
        lga: 'testLGA',
        address: 'testPropertyAddress',
        images: [
          '/C:/Users/AKANJI OLUWATOBILOBA/Pictures/Reference images/Maya_Walle_Final_Preview.jpg',
          '/C:/Users/AKANJI OLUWATOBILOBA/Pictures/Reference images/wine-colors-excerpt.jpg',
        ],
        price: 1000,
        period: 'Monthly',
        description: 'testPropertyDescription',
      };
      authenticationToken = {
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjU0LCJyb2xlIjoidXNlciIsImlhdCI6MTU3ODUzODcwOTY1NCwiZXhwIjoxNTc4NTM4NzEwNTU0fQ.Ct-LWeQRDkGhoGxxFIR49gjIGO-dnFr30pBmMiju08o',
      };
      const options = {
        method: 'POST',
        headers: authenticationToken,
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
