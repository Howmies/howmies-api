const pool = require('../configs/elephantsql');

module.exports = class {
  /**
     * @description Create a new housing property profile
     * @param {Number[]} featureIds The new features for the concerned properties
     * @param {Number} propertyId The database ID of the housing property
     */

  static async create(featureIds, propertyId) {
    const insertArr = () => {
      let text = '';
      for (let i = 0; i < featureIds.length; i += 1) {
        if (i === featureIds.length - 1) {
          text += `(${featureIds[i]}, ${propertyId})`;
        } else {
          text += `(${featureIds[i]}, ${propertyId}), `;
        }
      }
      return text;
    };

    const queryString = `INSERT INTO properties_and_features(
      feature_id, property_id
    ) VALUES ${insertArr()};`;

    try {
      await pool.query(queryString);
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
