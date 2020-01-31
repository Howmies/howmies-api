const request = require('request');
const { server } = require('../server');
const { port } = require('../server');
const { listen } = require('../server');

describe('Server', () => {
  let service;
  beforeAll((done) => {
    listen.close();
    service = server.listen(port);
    done();
  });
  afterAll((done) => {
    console.log('\x1b[42m\x1b[30m', 'Finished property-hunt unit tests\x1b[0m\n');
    service.close();
    done();
  });

  describe('GET /properties/:pagination', () => {
    const result = {};
    const uri = 'http://localhost:3000/api/v1/properties';
    let propertyHuntQuery;

    describe('for exceeding pagination index', () => {
      propertyHuntQuery = {
        location: 'Lagos',
        type: 'House',
        pagination: 1000,
      };
      const { location, type, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?location=${location}&type=${type}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for exceeding pagination index');
        done();
      });
      it('returns empty data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns empty data with disappointing success response message', () => {
        const expected = 'No property available';
        expect(result.message).toBe(expected);
      });
    });

    describe('for property\'s features that don\'t exist', () => {
      propertyHuntQuery = {
        location: 'Lagos',
        type: 'House',
        features: ['no-Pool', 'no-Yard'],
        pagination: 0,
      };
      const {
        location, type, features, pagination,
      } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?location=${location}&type=${type}&features=${features[0]}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for property\'s features that don\'t exist');
        done();
      });
      it('returns empty data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns empty data with disappointing success response message', () => {
        const expected = 'No property available';
        expect(result.message).toBe(expected);
      });
    });

    describe('for property\'s type that doesn\'t exist', () => {
      propertyHuntQuery = {
        type: 'No-Type',
        pagination: 0,
      };
      const { type, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?&type=${type}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for property\'s type that doesn\'t exist');
        done();
      });
      it('returns empty data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns empty data with disappointing success response message', () => {
        const expected = 'No property available';
        expect(result.message).toBe(expected);
      });
    });

    describe('for property\'s location that doesn\'t exist', () => {
      propertyHuntQuery = {
        location: 'Middle-of-nowhere',
        pagination: 0,
      };
      const { location, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?location=${location}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for property\'s location that doesn\'t exist');
        done();
      });
      it('returns empty data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns empty data with disappointing success response message', () => {
        const expected = 'No property available';
        expect(result.message).toBe(expected);
      });
    });

    describe('for properties by location only', () => {
      propertyHuntQuery = {
        location: 'Lagos',
        pagination: 0,
      };
      const { location, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?location=${location}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for properties by location only');
        done();
      });
      it('returns data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns data with success response message', () => {
        const expected = 'Property is available';
        expect(result.message).toBe(expected);
      });
    });

    describe('for properties by type only', () => {
      propertyHuntQuery = {
        location: 'Lagos',
        type: 'House',
        features: ['Pool'],
        pagination: 0,
      };
      const { type, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?type=${type}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for properties by type only');
        done();
      });
      it('returns data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns data with success response message', () => {
        const expected = 'Property is available';
        expect(result.message).toBe(expected);
      });
    });

    /* describe('for properties by features only', () => {
      propertyHuntQuery = {
        features: ['Pool'],
        pagination: 0,
      };
      const { features, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?features=${features[0]}`,
        options,
        (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for properties by features only');
        done();
      });
      it('returns data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns data with success response message', () => {
        const expected = 'Property is available';
        expect(result.message).toBe(expected);
      });
    });

    describe('for properties by a single feature only', () => {
      propertyHuntQuery = {
        features: 'Pool',
        pagination: 0,
      };
      const { features, pagination } = propertyHuntQuery;
      const options = {
        method: 'GET',
        json: true,
      };
      beforeAll((done) => {
        request(`${uri}/${pagination}/?features=${features}`, options, (error, response, body) => {
          result.status = response.statusCode;
          result.message = body.message;
          done();
        });
      });
      afterAll((done) => {
        console.log('Test complete for properties by a single feature only');
        done();
      });
      it('returns data with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('returns data with success response message', () => {
        const expected = 'Property is available';
        expect(result.message).toBe(expected);
      });
    }); */
  });
});
