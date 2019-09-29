const fs = require(`fs`);
const mysql = require(`./index`);

/** Self-executing asynchronous function so we can await results in this example */
(async () => {
  /** Create connection pool using loaded config */
  const pool = mysql.createPool(JSON.parse(fs.readFileSync(`mysql-config.json`)));

  pool.on(`acquire`, (connection) => {
    console.log(`Connection %d acquired`, connection.threadId);
  });
  
  pool.on(`connection`, (connection) => {
    console.log(`Connection %d connected`, connection.threadId);
  });

  pool.on(`enqueue`, () => {
    console.log(`Waiting for available connection slot`);
  });

  pool.on(`release`, function (connection) {
    console.log(`Connection %d released`, connection.threadId);
  });

  const connection = await pool.awaitGetConnection();
  
  connection.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
  });

  /** Perform query on connection */
  let result = await connection.awaitQuery(`SELECT * FROM transactions WHERE ticker = ?`, [`DE`]);
  
  /** Log output */
  console.log(result);
  
  /** Release connection */
  connection.release();
    
  /** Perform query on pool (opens a connection, runs query, releases connection) */
  result = await pool.awaitQuery(`SELECT * FROM transactions WHERE ticker = ?`, [`KSS`]);
  
  /** Log output */
  console.log(result);
  
  /** Get a new connection from the pool */
  const connection2 = await pool.awaitGetConnection();
  
  /** Begin a new transaction */
  await connection2.awaitBeginTransaction();
  
  /** Perform query for max id number in users table */
  result = await connection2.awaitQuery(`SELECT MAX(id) maxId FROM users`);
  
  /** Add one to max id to get new id number */
  const newId = result[0].maxId + 1;
  
  /** Insert new test user with new id number */
  await connection2.awaitQuery(`INSERT INTO users (id, hash, username, name, accounts) VALUES (?, ?, ?, ?, ?)`, [newId, ``, `testuser`, `Test User`, ``]);
  
  /** Commit transaction */
  await connection2.awaitCommit();
  
  /** Release connection */
  connection2.release();
  
  /** Close connection pool */
  await pool.awaitEnd();
})();
