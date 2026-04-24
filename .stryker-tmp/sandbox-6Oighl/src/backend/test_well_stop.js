// @ts-nocheck
const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'ada'
});

conn.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  
  conn.query('SELECT well FROM well_data WHERE well LIKE ? LIMIT 1', ['BSK%'], (err, res) => {
    if (err) {
      console.error('Query error:', err);
      conn.end();
      process.exit(1);
    }
    
    if (res && res.length > 0) {
      const well = res[0].well;
      console.log('Found well:', well);
      
      conn.query('UPDATE well_data SET c_current = 0 WHERE well = ?', [well], (err) => {
        if (err) {
          console.error('Update error:', err);
        } else {
          console.log('Set c_current = 0 for', well);
          console.log('Check frontend in next 2 seconds for notification popup in bottom-right corner');
        }
        conn.end();
      });
    } else {
      console.log('No well found');
      conn.end();
    }
  });
});
