const dotenv = require('dotenv');
const request = require('request');
const pool = require('../middleware/configs/elephantsql');
require('../server');

dotenv.config();

const testTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe('POST /auth/users/signup', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = testTimeout;
    console.log('\x1b[42m\x1b[30m', 'Finished user-signup unit tests\x1b[0m\n');
  });

  const uri = `http://localhost:${process.env.PORT}/api/v0.0.1/auth/users/signup`;

  fdescribe('with all data in correct format', () => {
    const result = {};
    const userSignupRequest = {
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

    it('successfully signs up user with response Status 200', (done) => {
      const expected = 200;
      expect(result.status).toBe(expected);
      done();
    });

    it('successfully signs up user with success response message', (done) => {
      const expected = 'Successfully logged in';
      expect(result.message).toBe(expected);
      done();
    });
  });

  describe('with user\'s name too long', () => {
    const result = {};

    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against user\'s name too long');
    });

    it('fails to sign up user with response Status 422', (done) => {
      const expected = 422;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'firstName';
      expect(result.message.find((e) => e.param === 'firstName').param).toBe(expected);
      done();
    });
  });

  describe('with excluded required data', () => {
    const result = {};

    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against excluded required data');
    });

    it('fails to sign up user with response Status 422', (done) => {
      const expected = 422;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'firstName';
      expect(result.message.find((e) => e.param === 'firstName').param).toBe(expected);
      done();
    });
  });

  describe('with empty required data', () => {
    const result = {};

    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against empty required data');
    });

    it('fails to sign up user with response Status 422', (done) => {
      const expected = 422;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'lastName';
      expect(result.message.find((e) => e.param === 'lastName').param).toBe(expected);
      done();
    });
  });

  describe('with wrong email format', () => {
    const result = {};
    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against wrong email format');
    });

    it('fails to sign up user with response Status 422', (done) => {
      const expected = 422;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'email';
      expect(result.message.find((e) => e.param === 'email').param).toBe(expected);
      done();
    });
  });

  describe('with wrong password format', () => {
    const result = {};
    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against wrong password format');
    });

    it('fails to sign up user with response Status 422', (done) => {
      const expected = 422;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'password';
      expect(result.message.find((e) => e.param === 'password').param).toBe(expected);
      done();
    });
  });

  describe('with wrong phone number format e.g. for Nigeria', () => {
    const result = {};
    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against wrong phone number format');
    });

    it('fails to sign up user with response Status 422', (done) => {
      const expected = 422;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'phone';
      expect(result.message.find((e) => e.param === 'phone').param).toBe(expected);
      done();
    });
  });

  describe('with already existing email', () => {
    const result = {};

    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against already existing email');
    });

    it('fails to sign up user with response Status 406', (done) => {
      const expected = 406;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'Account already in use';
      expect(result.message).toBe(expected);
      done();
    });
  });

  describe('with already existing phone number', () => {
    const result = {};
    const userSignupRequest = {
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

    afterEach(() => {
      console.log('Test complete against already existing phone number');
    });

    it('fails to sign up user with response Status 406', (done) => {
      const expected = 406;
      expect(result.status).toBe(expected);
      done();
    });

    it('fails to sign up user with response message', (done) => {
      const expected = 'Account already in use';
      expect(result.message).toBe(expected);
      done();
    });
  });
});
