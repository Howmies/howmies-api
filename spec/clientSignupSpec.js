const request = require('request');
const pool = require('../elephantsql');

describe('Server', () => {
  let server;

  beforeAll(() => {
    server = require('../server');
  });
  afterAll(() => {
    server.close();
  });
  describe('POST /auth/clients/signup', () => {
    const result = {};
    const uri = 'http://localhost:3000/api/v1/auth/clients/signup';
    let clientSignupRequest;

    describe('with all data in correct format', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testClientEmail@homies.com',
        phoneNumber: '+2349012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        pool.query('delete from clients where client_email=$1', ['testclientemail@homies.com'], (err) => {
          if (err) { console.log(err.name); }
          console.log('Test complete for fully correct format');
          done();
        });
      });
      it('successfully signs up client with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('successfully signs up client with success response message', () => {
        const expected = 'Successfully signed up';
        expect(result.message).toBe(expected);
      });
    });

    describe('with empty or excluded required data', () => {
      clientSignupRequest = {
        lastName: ' ',
        email: 'testClientEmail@homies.com',
        phoneNumber: '+2349012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against empty or excluded required data');
        done();
      });
      it('fails to sign up client with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'firstName';
        expect(result.message.find((e) => e.param === 'firstName').param).toBe(expected);
      });
    });

    describe('with wrong email format', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testClientEmail@homies',
        phoneNumber: '+2349012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against wrong email format');
        done();
      });
      it('fails to sign up client with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'email';
        expect(result.message.find((e) => e.param === 'email').param).toBe(expected);
      });
    });

    describe('with wrong password format', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testClientEmail@homies.com',
        phoneNumber: '+2349012345678',
        password: 'test',
        confirmPassword: 'test',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against wrong password format');
        done();
      });
      it('fails to sign up client with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'password';
        expect(result.message.find((e) => e.param === 'password').param).toBe(expected);
      });
    });

    describe('with wrong phone number format', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testClientEmail@homies.com',
        phoneNumber: '09012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against wrong phone number format');
        done();
      });
      it('fails to sign up client with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'phoneNumber';
        expect(result.message.find((e) => e.param === 'phoneNumber').param).toBe(expected);
      });
    });

    describe('with dissimilar confirmation password', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testClientEmail@homies.com',
        phoneNumber: '+2349012345678',
        password: 'testPassword',
        confirmPassword: 'testPasswded',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against dissimilar confirmation password');
        done();
      });
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'confirmPassword';
        expect(result.message.find((e) => e.param === 'confirmPassword').param).toBe(expected);
      });
    });

    describe('with already existing email', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'clientUser@homies.com',
        phoneNumber: '+2349012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against already existing email');
        done();
      });
      it('fails to sign up client with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'Account already in use';
        expect(result.message).toBe(expected);
      });
    });

    describe('with already existing phone number', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testClientEmail@homies.com',
        phoneNumber: '+2349123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against already existing phone number');
        done();
      });
      it('fails to sign up client with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'Account already in use';
        expect(result.message).toBe(expected);
      });
    });

    describe('with similar email of a real estate agent', () => {
      clientSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'try_email21@howmies.com',
        phoneNumber: '+2349012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: clientSignupRequest,
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
        console.log('Test complete against similar email of a real estate agent');
        done();
      });
      it('fails to sign up client with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up client with response message', () => {
        const expected = 'Account exists as Real Estate Agent';
        expect(result.message).toBe(expected);
      });
    });
  });
});
