const request = require('request');
const server = require('../server');

describe('Server', () => {
  beforeAll((done) => {
    server.startServer();
    done();
  });
  afterAll((done) => {
    console.log('\x1b[42m\x1b[30m', 'Finished user-login unit tests\x1b[0m\n');
    server.closeServer();
    done();
  });

  describe('POST /auth/users/login', () => {
    const result = {};
    const uri = 'http://localhost:3000/api/v1/auth/users/login';
    let userLoginRequest;

    describe('with all data in correct format', () => {
      userLoginRequest = {
        email: 'tryUser@howmies.com',
        password: 'tryPassword',
      };
      const options = {
        method: 'POST',
        body: userLoginRequest,
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
        console.log('Test complete for fully correct data format');
        done();
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

    describe('with excluded required data', () => {
      userLoginRequest = {
        email: 'tryUser@howmies.com',
      };
      const options = {
        method: 'POST',
        body: userLoginRequest,
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
        console.log('Test complete against excluded required data');
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

    describe('with empty required data', () => {
      userLoginRequest = {
        email: 'tryUser@howmies.com',
        password: ' ',
      };
      const options = {
        method: 'POST',
        body: userLoginRequest,
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
        console.log('Test complete against empty required data');
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

    describe('with wrong email format', () => {
      userLoginRequest = {
        email: 'testUserEmail@howmies',
        password: 'tryPassword',
      };
      const options = {
        method: 'POST',
        body: userLoginRequest,
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
      userLoginRequest = {
        email: 'tryUser@howmies.com',
        password: 'test',
      };
      const options = {
        method: 'POST',
        body: userLoginRequest,
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
      it('fails to sign up user with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'password';
        expect(result.message.find((e) => e.param === 'password').param).toBe(expected);
      });
    });

    describe('with incorrect user information', () => {
      userLoginRequest = {
        email: 'testUserEmail@howmies.com',
        password: 'tryPassworded',
      };
      const options = {
        method: 'POST',
        body: userLoginRequest,
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
        console.log('Test complete against incorrect user information');
        done();
      });
      it('fails to sign up user with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up user with response message', () => {
        const expected = 'Incorrect email or password';
        expect(result.message).toBe(expected);
      });
    });
  });
});
