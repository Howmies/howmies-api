const pool = require('../configs/elephantsql');

module.exports = class {
  /**
   * To be used for requests that have no feature field.
   * @param {Response} response
   * @param {Number} pagination The zero-index page number for the requested data.
   * Note: 10 items per page.
   *
   * Only items with images are outputted
   */

  constructor(pagination) {
    this.pagination = pagination;
  }

  /**
   * Get a housing property by its ID.
   * @param {Number} id The property ID.
   * @returns
   */

  static async GetById(id) {
    const queryString = `SELECT p.id, p.address, p.lga, p.state, p.price, per.name, s.name, 
      STRING_AGG(DISTINCT f.name, E', ' ORDER BY f.name ASC) AS all_features,
      p.desc, p.owner_id, p.date_time_created, p.phone, p.email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p, status_types as s, status_periods as per, images as img
      LEFT JOIN properties_and_features as pf ON p.id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE p.id=$1, p.status_id=s.id, p.period_id=per.id, img.property_id=p.id
      GROUP BY p.id, per.name, s.name;`;

    const queryValues = [id];

    try {
      const { rowCount, rows } = await pool.query(queryString, queryValues);
      return Promise.resolve({ rowCount, row: rows[0] });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Search for housing properties by location only.
   * @param {String} location Location could be the name of a state or LGA.
   * @returns
   */

  async getByLocation(location) {
    const queryString = `SELECT p.id, p.address, p.lga, p.state, p.price, per.name, s.name, 
      STRING_AGG(DISTINCT f.name, E', ' ORDER BY f.name ASC) AS all_features, p.desc, p.owner_id, p.date_time_created, p.phone, p.email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p
      INNER JOIN status_types as s ON p.status_id=s.id
      INNER JOIN status_periods as per ON p.period_id=per.id
      INNER JOIN images as img ON img.property_id=p.id
      LEFT JOIN properties_and_features as pf ON p.id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE (p.state=$1 OR p.lga=$1) AND p.period_id=per.id
      GROUP BY p.id, per.name, s.name ORDER BY p.date_time_created DESC OFFSET $2 LIMIT 10;`;

    const queryValues = [location, this.pagination];

    try {
      const { rowCount, rows } = await pool.query(queryString, queryValues);
      return Promise.resolve({ rowCount, rows });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Search for housing properties of a certain type.
   * @param {String} type The type of housing property.
   * @returns
   */

  async getByPropertyType(type) {
    const queryString = `SELECT p.id, p.address, p.lga, p.state, p.price, per.name, s.name, 
      STRING_AGG(DISTINCT f.name, E', ' ORDER BY f.name ASC) AS all_features, p.desc, p.owner_id, p.date_time_created, p.phone, p.email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p
      INNER JOIN status_types as s ON p.status_id=s.id
      INNER JOIN status_periods as per ON p.period_id=per.id
      INNER JOIN images as img ON img.property_id=p.id
      LEFT JOIN properties_and_features as pf ON p.id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE p.period_id=per.id
      AND p.type_id IN (SELECT t.id FROM property_types as t WHERE t.name=$1)
      GROUP BY p.id, per.name, s.name ORDER BY p.date_time_created DESC OFFSET $2 LIMIT 10;`;

    const queryValues = [type, this.pagination];

    try {
      const { rowCount, rows } = await pool.query(queryString, queryValues);
      return Promise.resolve({ rowCount, rows });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Search for housing properties of a certain type and location.
   * @param {String} location Location could be the name of a state or LGA.
   * @param {String} type The type of housing property.
   * @returns
   */

  async getByLocationAndPropertyType(location, type) {
    const queryString = `SELECT p.id, p.address, p.lga, p.state, p.price, per.name, s.name, 
      STRING_AGG(DISTINCT f.name, E', ' ORDER BY f.name ASC) AS all_features, p.desc, p.owner_id, p.date_time_created, p.phone, p.email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p
      INNER JOIN status_types as s ON p.status_id=s.id
      INNER JOIN status_periods as per ON p.period_id=per.id
      INNER JOIN images as img ON img.property_id=p.id
      LEFT JOIN properties_and_features as pf ON p.id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE (p.state=$1 OR p.lga=$1) AND p.period_id=per.id
      AND p.type_id IN (SELECT t.id FROM property_types as t WHERE t.name=$2)
      GROUP BY p.id, per.name, s.name ORDER BY p.date_time_created DESC OFFSET $3 LIMIT 10;`;

    const queryValues = [location, type, this.pagination];

    try {
      const { rowCount, rows } = await pool.query(queryString, queryValues);
      return Promise.resolve({ rowCount, rows });
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
