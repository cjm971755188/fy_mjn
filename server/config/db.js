const mysql = require('mysql');

const db = mysql.createConnection({
  host      : 'sh-cdb-r0xtkc0c.sql.tencentcdb.com',
  port      : '58649',
  user      : 'root',
  password  : 'l130112210121',
  database  : 'fy_mjn'
})

module.exports = db