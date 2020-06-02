const pool = require('./configs/elephantsql');

module.exports = class {
  /**
   * To be used for requests have no feature field.
   * @param {Response} response
   * @param {Number} pagination The zero-index page number for the requested data.
   * Note: 10 items per page.
   *
   * Only items with images are outputted
   */
  constructor(response, pagination) {
    this.pagination = pagination;

    /**
     * Callback function for pool.query() implementations.
     * @param {Error} err The usual error parameter of the pool.query() callback function.
     * @param {Object} result The usual result parameter of the pool.query() callback function.
     * @returns {Response} Express.js HTTP response.
     */
    this.resultResponse = (err, result) => {
      if (err) {
        return response.status(500).send({
          remark: 'Error',
          message: err.message,
        });
      }
      if (result.rows.length === 0) {
        return response.status(200).send({
          remark: 'Empty',
          message: 'No property available',
        });
      }

      return response.status(200).send({
        remark: 'Success',
        message: 'Property available',
        data: result.rows,
      });
    };
  }

  /**
   * Search for housing properties by location only.
   * @param {String} location Location could be the name of a state or LGA.
   * @returns {Response} Express.js HTTP response.
   */
  byLocation(location) {
    return pool.query(
      `SELECT p.property_id, p.address, p.lga, p.state, p.price, per.period_name, s.status_name, 
      STRING_AGG(DISTINCT f.feature_name, E', ' ORDER BY f.feature_name ASC) AS all_features, p.property_desc, p.owner_id, p.post_date, p.property_phone, p.property_email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p
      INNER JOIN status_types as s ON p.status_type=s.id
      INNER JOIN status_periods as per ON p.period=per.id
      INNER JOIN images as img ON img.property_id=p.property_id
      LEFT JOIN properties_features as pf ON p.property_id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE (p.state=$1 OR p.lga=$1) AND p.period=per.id
      GROUP BY p.property_id, per.period_name, s.status_name ORDER BY p.post_date DESC OFFSET $2 LIMIT 10`,
      [location, this.pagination],
      this.resultResponse,
    );
  }

  /**
   * Search for housing properties of a certain type.
   * @param {String} type The type of housing property.
   * @returns {Response} Express.js HTTP response.
   */
  byPropertyType(type) {
    pool.query(
      `SELECT p.property_id, p.address, p.lga, p.state, p.price, per.period_name, s.status_name, 
      STRING_AGG(DISTINCT f.feature_name, E', ' ORDER BY f.feature_name ASC) AS all_features, p.property_desc, p.owner_id, p.post_date, p.property_phone, p.property_email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p
      INNER JOIN status_types as s ON p.status_type=s.id
      INNER JOIN status_periods as per ON p.period=per.id
      INNER JOIN images as img ON img.property_id=p.property_id
      LEFT JOIN properties_features as pf ON p.property_id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE p.period=per.id
      AND p.property_type IN (SELECT t.id FROM property_types as t WHERE t.property_name=$1)
      GROUP BY p.property_id, per.period_name, s.status_name ORDER BY p.post_date DESC OFFSET $2 LIMIT 10`,
      [type, this.pagination],
      this.resultResponse,
    );
  }

  /**
   * Search for housing properties of a certain type and location
   * @param {String} location Location could be the name of a state or LGA.
   * @param {String} type The type of housing property.
   * @returns {Response} Express.js HTTP response.
   */
  byLocationAndPropertyType(location, type) {
    pool.query(
      `SELECT p.property_id, p.address, p.lga, p.state, p.price, per.period_name, s.status_name, 
      STRING_AGG(DISTINCT f.feature_name, E', ' ORDER BY f.feature_name ASC) AS all_features, p.property_desc, p.owner_id, p.post_date, p.property_phone, p.property_email,
      ARRAY_AGG(DISTINCT img.image_url) AS all_images
      FROM properties AS p
      INNER JOIN status_types as s ON p.status_type=s.id
      INNER JOIN status_periods as per ON p.period=per.id
      INNER JOIN images as img ON img.property_id=p.property_id
      LEFT JOIN properties_features as pf ON p.property_id=pf.property_id
      LEFT JOIN features as f ON pf.feature_id=f.id
      WHERE (p.state=$1 OR p.lga=$1) AND p.period=per.id
      AND p.property_type IN (SELECT t.id FROM property_types as t WHERE t.property_name=$2)
      GROUP BY p.property_id, per.period_name, s.status_name ORDER BY p.post_date DESC OFFSET $3 LIMIT 10`,
      [location, type, this.pagination],
      this.resultResponse,
    );
  }
};
