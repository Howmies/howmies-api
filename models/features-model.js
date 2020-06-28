const pool = require('../configs/elephantsql');

module.exports = class {
  constructor(featureName) {
    this.name = featureName;
  }

  /**
   * Get a features by their name.
   * @param {Number} propertyId The property ID.
   * @returns {Promise}
   */

  static async getByName(propertyId) {
    const queryString = `SELECT
      f.name AS feature
    FROM
      features AS f,
      properties_and_features AS pf
    WHERE
      pf.property_id=$1
      AND f.id=pf.feature_id`;

    const queryValues = [propertyId];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get features by their name.
   * @param {String[]} features The property ID.
   * @returns {Promise}
   */

  static async getForManyByName(features) {
    const selectArr = () => {
      let text = '';
      for (let i = 0; i < features.length; i += 1) {
        if (i === features.length - 1) {
          text += features[i].toLowerCase();
        } else {
          text += `${features[i].toLowerCase()}, `;
        }
      }
      return text;
    };
    const queryString = `SELECT features.id FROM features
      WHERE features.name = ANY($1::text[]);`;

    const queryValues = [`{${selectArr()}}`];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * @description Create new housing property accessory features
     * @param {String[]} features The type of housing property
     * @returns {Promise}
     */

  static async create(features) {
    const insertArr = () => {
      let text = '';
      for (let i = 0; i < features.length; i += 1) {
        if (i === features.length - 1) {
          text += `('${features[i].toLowerCase()}')`;
        } else {
          text += `('${features[i].toLowerCase()}'), `;
        }
      }
      return text;
    };

    const queryString = `INSERT INTO features(name) VALUES ${insertArr()}
      ON CONFLICT (name) DO NOTHING;`;

    try {
      await pool.query(queryString);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * @description Update housing property accessory feature
     * @param {id} id Object containing data to be used for update
     * @param {String} updateName The type of housing property
     * @returns {Promise}
     */

  static async update(id, updateName) {
    const queryString = `UPDATE features
    SET name=$2 WHERE "id"=$1
    RETURNING *;`;

    const queryValues = [id, updateName];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * @description Delete housing property accessory feature
     * @param {String} name The feature name
     * @returns {Promise}
     */

  static async delete(name) {
    const queryString = 'DELETE FROM features WHERE name=$1;';
    const queryValues = [name];
    try {
      await pool.query(queryString, queryValues);
      return Promise.resolve('Property deleted successfully');
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
