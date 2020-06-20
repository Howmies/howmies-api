const pool = require('../configs/elephantsql');

module.exports = class {
  constructor(uid) {
    this.uid = uid;
  }

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
      owner_id, property_type, state, lga, address, status_type, price,
      period, property_desc, property_phone, property_email, post_date
    )
    SELECT $1, property_types.id, $3, $4, $5, status_types.id, $7, status_periods.id, $9, $10, $11
      FROM property_types, status_types, status_periods
      WHERE property_types.property_name=$2 AND status_types.status_name=$6 AND status_periods.period_name=$8
    RETURNING property_id`;

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
      const { rowCount, rows } = await pool.query(queryString, queryValues);
      return Promise.resolve({ rowCount, rows });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async update(newPropertyData) {
    const setUpdate = () => {
      let text;

      Object.keys(newPropertyData).forEach((k, i) => {
        if (newPropertyData[k] != null) {
          text = '';
          if (i === Object.keys(newPropertyData).length - 1) {
            text += `${k}='${newPropertyData[k]}'`;
          } else {
            text += `${k}='${newPropertyData[k]}', `;
          }
        }
      });

      return text;
    };

    const queryString = `UPDATE properties
    SET ${setUpdate()}
    WHERE id=$1
    RETURNING *;`;

    const queryValues = [this.id];

    try {
      const { rowCount, rows } = await pool.query(queryString, queryValues);
      return Promise.resolve({ rowCount, rows });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async deleteById(id) {
    const queryString = 'DELETE FROM properties WHERE id=$1;';
    const queryValues = [id];
    try {
      await pool.query(queryString, queryValues);
      return Promise.resolve('Property deleted successfully');
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
