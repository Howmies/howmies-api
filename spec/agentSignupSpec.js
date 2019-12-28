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
  describe('POST /auth/real_estate_agents/signup', () => {
    const result = {};
    const uri = 'http://localhost:3000/api/v1/auth/real_estate_agents/signup';
    let agentSignupRequest;

    describe('with all data in correct format', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '+2347123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        pool.query('delete from real_estate_agents where email=$1', ['testemail@homies.com'], (err) => {
          if (err) { console.log(err.name); }
          console.log('Test complete for fully correct format');
          done();
        });
      });
      it('successfully signs up agent with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('successfully signs up agent with success response message', () => {
        const expected = 'Successfully signed up';
        expect(result.message).toBe(expected);
      });
    });

    describe('with empty optional data', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: ' ',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        console.log('Test complete against empty optional data');
        done();
      });
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'mobileNumber';
        expect(result.message.find((e) => e.param === 'mobileNumber').param).toBe(expected);
      });
    });

    describe('with empty or excluded required data', () => {
      agentSignupRequest = {
        address: ' ',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '07123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'address';
        expect(result.message.find((e) => e.param === 'address').param).toBe(expected);
      });
    });

    describe('with excluded optional data', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        pool.query('delete from real_estate_agents where email=$1', ['testemail@homies.com'], (err) => {
          if (err) { console.log(err.name); }
          console.log('Test complete for excluded optional data');
          done();
        });
      });
      it('successfully signs up agent with response Status 200', () => {
        const expected = 200;
        expect(result.status).toBe(expected);
      });
      it('successfully signs up agent with success response message', () => {
        const expected = 'Successfully signed up';
        expect(result.message).toBe(expected);
      });
    });

    describe('with wrong email format', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies',
        officeNumber: '07012345678',
        mobileNumber: '07123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'email';
        expect(result.message.find((e) => e.param === 'email').param).toBe(expected);
      });
    });

    describe('with wrong office number format', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '0701234567',
        mobileNumber: '07123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        console.log('Test complete against wrong office number format');
        done();
      });
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'officeNumber';
        expect(result.message.find((e) => e.param === 'officeNumber').param).toBe(expected);
      });
    });

    describe('with wrong mobile number format', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '071234567890',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        console.log('Test complete against wrong mobile number format');
        done();
      });
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'mobileNumber';
        expect(result.message.find((e) => e.param === 'mobileNumber').param).toBe(expected);
      });
    });

    describe('with mobile number similar to office number', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '07012345678',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        console.log('Test complete against mobile number similar to office number');
        done();
      });
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'mobileNumber';
        expect(result.message.find((e) => e.param === 'mobileNumber').param).toBe(expected);
      });
    });

    describe('with wrong password format', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '07123456789',
        password: 'test',
        confirmPassword: 'test',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
      it('fails to sign up agent with response Status 422', () => {
        const expected = 422;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'password';
        expect(result.message.find((e) => e.param === 'password').param).toBe(expected);
      });
    });

    describe('with dissimilar confirmation password', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'testEmail@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '07123456789',
        password: 'testPassword',
        confirmPassword: 'testPasswded',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'try_email21@howmies.com',
        officeNumber: '07012345678',
        mobileNumber: '07123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
      it('fails to sign up agent with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'Account already in use';
        expect(result.message).toBe(expected);
      });
    });

    describe('with similar email of a property owner or client', () => {
      agentSignupRequest = {
        agentName: 'testName',
        address: 'testAddress',
        lga: 'testLGA',
        state: 'testState',
        email: 'landlord@homies.com',
        officeNumber: '07012345678',
        mobileNumber: '07123456789',
        password: 'testPassword',
        confirmPassword: 'testPassword',
      };
      const options = {
        method: 'POST',
        body: agentSignupRequest,
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
        console.log('Test complete against email similar to a registered property owner or client email');
        done();
      });
      it('fails to sign up agent with response Status 406', () => {
        const expected = 406;
        expect(result.status).toBe(expected);
      });
      it('fails to sign up agent with response message', () => {
        const expected = 'Account exists as Property Owner or Client';
        expect(result.message).toBe(expected);
      });
    });
  });
});
