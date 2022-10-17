
import mysql from "mysql"

var con = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  database: 'neom',
  user: 'root',
  password: '',
  ssl: false,
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


const fetchPLaces = (cb) => {
  con.query("SELECT * FROM places", function (err, result) {
    cb(err,result)
  });
};

export {fetchPLaces}
