const fs = require(`fs`);
const mysql = require(`./index`);

/** Self-executing asynchronous function so we can await results in this example */
(async () => {
  /** Create connection pool using loaded config */
  const connection = mysql.createConnection(JSON.parse(fs.readFileSync(`mysql-config.json`)));

  connection.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
  });

  /** Perform query on connection */
  let result = await connection.awaitQuery(`SELECT * FROM people WHERE lastName = ?`, [`Doe`]);
  
  /** Log output */
  console.log(result);
    
  /** Begin a new transaction */
  await connection.awaitBeginTransaction();
  
  /** Perform query for max id number in users table */
  result = await connection.awaitQuery(`SELECT MAX(id) maxId FROM people`);
  
  /** Add one to max id to get new id number */
  const newId = result[0].maxId + 1;
  
  /** Insert new test user with new id number */
  await connection.awaitQuery(`INSERT INTO people (id, firstName, lastName, age) VALUES (?, ?, ?, ?)`, [newId, `Ebenezer`, `Scrooge`, 142]);
  
  /** Commit transaction */
  await connection.awaitCommit();
  
  /** Test error handling */
  try {
    await connection.awaitQuery(`SELECTJKLSDF`);
  } catch (err) {
    console.log(err);
  }
    
  /** End the connection */
  connection.awaitEnd();
})();
