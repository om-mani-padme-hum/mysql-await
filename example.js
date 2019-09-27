const fs = require(`fs`);
const mysql = require(`./index`);

/** Self-executing asynchronous function so we can await results in this example */
(async () => {
  /** Create connection pool using loaded config */
  const db = mysql(JSON.parse(fs.readFileSync(`mysql-config.json`)));

  /** Perform query (opens a connection, runs query, releases connection) */
  const result = await db.query(`SELECT * FROM transactions WHERE ticker = ?`, [`DE`]);
  
  /** Log output */
  console.log(result);
  
  /** Close connection pool */
  db.end();
})();
