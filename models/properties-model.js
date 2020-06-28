const pool = require('../configs/elephantsql');

module.exports = class {
  /**
   * @description Perform CREATE, UPDATE and DELETE operations on properties
   * without properties features.
   * @param {Number} uid The user ID.
   */
  constructor(uid) {
    this.uid = uid;
  }

  /**
   * @description Create a new housing property profile.
   * @param {String} newPropertyData.type The type of housing property.
   * @param {String} newPropertyData.state The state where the housing property is located.
   * @param {String} newPropertyData.lga The LGA where the housing property is located.
   * @param {String} newPropertyData.address
   * The full physical address where the housing property is located.
   * @param {String} newPropertyData.status
   * The kind of service the housing property is being opted for.
   * @param {Number} price
   * The price for the period with which the housing property is to be serviced.
   * @param {String} newPropertyData.period The period for which the property is to be serviced.
   * @param {String} newPropertyData.desc Other details about the property.
   * @param {String} newPropertyData.phone Phone contact specific to the property if required.
   * @param {String} newPropertyData.email Email contact specific to the property if required.
   * @returns {Response} The id of the housing property on success.
   */

  async create(
    type,
    state,
    lga,
    address,
    status,
    price,
    period,
    desc,
    phone,
    email,
  ) {
    const queryString = `INSERT INTO properties(
      owner_id, type_id, state, lga, address, status_id,
      price, period_id, "desc", phone, email
    )
    SELECT $1, pt.id, $3, $4, $5, st.id, $7, sp.id, $9, $10, $11
    FROM property_types AS pt, status_types AS st, status_periods AS sp
    WHERE pt.name=$2 AND st.name=$6 AND sp.name=$8
    RETURNING *;`;

    const queryValues = [
      this.uid,
      type,
      state,
      lga,
      address,
      status,
      price,
      period,
      desc,
      phone,
      email,
    ];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0].id);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description Update housing property profile
   * @param {Object} newPropertyData Object containing data to be used for update
   * @param {String} newPropertyData.type The type of housing property
   * @param {String} newPropertyData.state The state where the housing property is located
   * @param {String} newPropertyData.lga The LGA where the housing property is located
   * @param {String} newPropertyData.address
   * The full physical address where the housing property is located
   * @param {String} newPropertyData.status
   * The kind of renewal service the housing property is being opted for
   * @param {Number} newPropertyData.price
   * The price for the period with which the housing property is to be serviced
   * @param {String} newPropertyData.period The period for which the property is to be serviced
   * @param {String} newPropertyData.desc Other details about the property
   * @param {String} newPropertyData.phone Phone contact specific to the property if required
   * @param {String} newPropertyData.email Email contact specific to the property if required
   */

  async update(newPropertyData) {
    const setUpdate = () => {
      let text = '';

      Object.keys(newPropertyData).forEach((k, i, arr) => {
        if (newPropertyData[k] != null) {
          text += `${k}=`;

          switch (k) {
            case 'type':
              text += 'pt.id';
              break;

            case 'status':
              text += 'st.id';
              break;

            case 'period':
              text += 'sp.id';
              break;

            default:
              text += `'${newPropertyData[k]}'`;
              break;
          }

          if (i !== arr.length - 1) {
            text += ', ';
          }
        }
      });

      return text;
    };

    const setUpdateForId = () => {
      let text = '';

      Object.keys(newPropertyData).forEach((k) => {
        if (newPropertyData[k] != null) {
          text += `
          INNER JOIN 
          `;
          switch (k) {
            case 'type':
              text += `
              property_types pt
              ON properties.type_id = pt.id 
              `;
              break;

            case 'status':
              text += `
              status_types st
              ON properties.status_id = st.id 
              `;
              break;

            case 'period':
              text += `
              status_periods sp
              ON properties.period_id = sp.id 
              `;
              break;

            default:
              break;
          }
        }
      });

      return text;
    };

    const queryString = `UPDATE properties
    SET ${setUpdate()}
    ${setUpdateForId()}
    WHERE users.id=$1
    RETURNING *;`;

    const queryValues = [this.uid];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description Delete the specified property of the authorized user
   * @param {Number} id The id of the housing property
   */

  async deleteById(id) {
    const queryString = 'DELETE FROM properties WHERE "id"=$1 AND owner_id=$2;';
    const queryValues = [id, this.uid];
    try {
      await pool.query(queryString, queryValues);
      return Promise.resolve('Property deleted successfully');
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
