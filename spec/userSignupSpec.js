const dotenv = require('dotenv');
const request = require('request');
const pool = require('../middleware/configs/elephantsql');
require('../server');

dotenv.config();

describe('Server', () => {
  afterAll(() => {
    console.log('\x1b[42m\x1b[30m', 'Finished user-signup unit tests\x1b[0m\n');
  });

  describe('POST /auth/users/signup', () => {
    const result = {};
    const uri = `http://localhost:${process.env.PORT}/api/v0.0.1/auth/users/signup`;
    let userSignupRequest;

    describe('with all data in correct format', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testUserEmail@howmies.com',
        phone: '+2349012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        pool.query('delete from users where email=$1', ['testuseremail@howmies.com'], (err) => {
          if (err) { return console.error(`Error deleting from database - ${err.message}`); }
          console.log('Test complete for fully correct data format');
          done();
        });
      });
      it('successfully signs up user with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('successfully signs up user with success response message', () => {
        const expected = 'Successfully logged in';
        expect(result.message).toBe(expected);
      });
    });

    describe('with user\'s name too long', () => {
      userSignupRequest = {
        firstName: 'testFirstNametestFirstName',
        lastName: 'testLastName',
        email: 'testUserEmail@howmies.com',
        phone: '+2349012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against user\'s name too long');
        done();
      });
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'firstName';
        expect(result.message.find((e) => e.param === 'firstName').param).toBe(expected);
      });
    });

    describe('with excluded required data', () => {
      userSignupRequest = {
        lastName: 'testLastName',
        email: 'testUserEmail@howmies.com',
        phone: '+2349012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against excluded required data');
        done();
      });
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'firstName';
        expect(result.message.find((e) => e.param === 'firstName').param).toBe(expected);
      });
    });

    describe('with empty required data', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: ' ',
        email: 'testUserEmail@howmies.com',
        phone: '+2349012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against empty required data');
        done();
      });
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'lastName';
        expect(result.message.find((e) => e.param === 'lastName').param).toBe(expected);
      });
    });

    describe('with wrong email format', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testuserEmail@howmies',
        phone: '+2349012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against wrong email format');
        done();
      });
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'email';
        expect(result.message.find((e) => e.param === 'email').param).toBe(expected);
      });
    });

    describe('with wrong password format', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testUserEmail@howmies.com',
        phone: '+2349012345678',
        password: 'test',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against wrong password format');
        done();
      });
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'password';
        expect(result.message.find((e) => e.param === 'password').param).toBe(expected);
      });
    });

    describe('with wrong phone number format e.g. for Nigeria', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testUserEmail@howmies.com',
        phone: '190123456781',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against wrong phone number format');
        done();
      });
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'phone';
        expect(result.message.find((e) => e.param === 'phone').param).toBe(expected);
      });
    });

    describe('with already existing email', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'tryUser@howmies.com',
        phone: '+2349012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against already existing email');
        done();
      });
      it('fails to sign up user with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'Account already in use';
        expect(result.message).toBe(expected);
      });
    });

    describe('with already existing phone number', () => {
      userSignupRequest = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'testUserEmail@howmies.com',
        phone: '+2348012345678',
        password: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: userSignupRequest,
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
        console.log('Test complete against already existing phone number');
        done();
      });

      it('fails to sign up user with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });

      it('fails to sign up user with response message', () => {
        const expected = 'Account already in use';
        expect(result.message).toBe(expected);
      });
    });
  });
});
