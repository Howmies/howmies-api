const UsersModel = require('../../models/users-model');
const HashHandler = require('../../utils/hash-handler');

const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'tobia807@howmies.com',
  phone: '+2348022345678',
  password: HashHandler.generateHash('howmiesAPIv1'),
};

const {
  firstName, lastName, email, phone, password,
} = user;

module.exports.newMockUser = UsersModel.create(email, phone, password, firstName, lastName)
  .then((result) => ({
    uid: result.uid,
    email: result.email,
  }))
  .catch(() => null);

/**
 * Delete mock user
 * @param {Number} uid
 */

module.exports.deleteMockUser = (uid) => UsersModel
  .deleteById(uid)
  .catch(() => null);
