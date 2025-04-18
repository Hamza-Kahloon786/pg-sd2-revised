// Get the credentials from .env file
require('dotenv').config();

// Get the client
const mysql = require('mysql2/promise');

// Create the connection pool

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// Utility function to query the database
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

module.exports = { query };