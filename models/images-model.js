const pool = require('../configs/elephantsql');

module.exports = class {
  /**
   * Get, Create and Delete images in the database
   * @param {Number} propertyId The ID of the concerned housing property
   */
  constructor(propertyId) {
    this.propertyId = propertyId;
  }

  /**
   * Get the number of images avalable for a housing property.
   * @returns {Promise}
   */

  async getImageCount() {
    const queryString = 'SELECT COUNT(property_id) FROM images WHERE property_id=$1';
    const queryValues = [this.propertyId];

    try {
      const { rows } = await pool.query(queryString, queryValues);

      // convert the count to a positive integer

      const imageCount = +rows[0].count;
      return Promise.resolve(imageCount);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * @description Store the URLs of uploaded images
     * @param {String[]} imageURLs The url list of images uploaded
     * @returns {Promise}
     */

  async create(imageURLs) {
    const insertArr = (imageURLs.length > 0) ? () => {
      let text = '';
      for (let i = 0; i < imageURLs.length; i += 1) {
        if (i === imageURLs.length - 1) {
          text += `('${imageURLs[i]}', ${this.propertyId})`;
        } else {
          text += `('${imageURLs[i]}', ${this.propertyId}), `;
        }
      }
      return text;
    } : null;

    const queryString = `INSERT INTO images(image_url, property_id)
      VALUES ${insertArr()} RETURNING *;`;

    try {
      const { rows } = await pool.query(queryString);
      return Promise.resolve(rows);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * @description Update housing property profile
     * @param {Number} id The image ID
     * @returns {Promise}
     */

  static async deleteById(id) {
    const queryString = 'DELETE FROM images WHERE "id"=$1;';
    const queryValues = [id];
    try {
      await pool.query(queryString, queryValues);
      return Promise.resolve('Images deleted successfully');
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * @description Update housing property profile
     * @returns {Promise}
     */

  async deleteByPropertyId() {
    const queryString = 'DELETE FROM images WHERE property_id=$1;';
    const queryValues = [this.propertyId];
    try {
      await pool.query(queryString, queryValues);
      return Promise.resolve('Images deleted successfully');
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
