const mysql = require('mysql');
/*
const db = mysql.createConnection({
  host      : 'sh-cdb-r0xtkc0c.sql.tencentcdb.com',
  post      : '58649',
  user      : 'root',
  password  : 'l130112210121',
  database  : 'fy_mjn'
})
*/

const db = mysql.createConnection({
  host      : 'localhost',
  user      : 'root',
  password  : '123456',
  database  : 'fy_mjn'
})

module.exports = db