const mysql = require("mysql2/promise");
const configs = require("../configs/index");
const pool = mysql.createPool(configs.mysql);
const query = async (str, params, one) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const [rows, data] = await connection.query(str, params || []);
  connection.release();
  if (one) {
    return rows[0];
  }
  return rows;
};

const getConntection = async () => {
  return await pool.getConnection();
};

const insertGetId = async (connection, query, params) => {
  const [rows, data] = await connection.query(query, params || []);
  return rows.insertId;
};

module.exports = {
  query,
  getConntection,
  insertGetId,
  escape: mysql.escape,
  escapeId: mysql.escapeId,
};
