
import mysql from "mysql"

var con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  ssl: false,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});


const fetchPLaces = (cb) => {
  con.query("SELECT * FROM places", function (err, result) {
    cb(err, result)
  });
};

export { fetchPLaces }
