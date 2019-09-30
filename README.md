# MySQL Async/Await Wrapper v2.0.4

Simple wrapper for MySQL async/await functionality.  Intended for functionality to mimic the popular [mysql](https://github.com/mysqljs/mysql) Node.js callback-based package, but with additional methods for awaiting execution.  Goal is for normal methods to be unaffected and only additional await methods added, though accomplished through intermediary class objects.

## Provided async/await methods

The methods below have been added as async/await wrappers to existing MySQL methods of similar name.  In order to use them, simply "await" their execution rather than passing a callback for the last argument of the function call.  For original methods for which "await" methods may have been added, as needed, see the [mysql](https://github.com/mysqljs/mysql) library.

### Connections from mysql.createConnect()

* Connection.awaitBeginTransaction()
* Connection.awaitChangeUser(params)
* Connection.awaitCommit()
* Connection.awaitConnect()
* Connection.awaitDestroy()
* Connection.awaitEnd()
* Connection.awaitQuery(query[, params])
* Connection.awaitRollback()

### Connection Pool's from mysql.createPool()

* Pool.awaitEnd()
* Pool.awaitGetConnection()
* Pool.awaitQuery(query[, params])

### Connections from pool.getConnection()

* Connection.awaitBeginTransaction()
* Connection.awaitChangeUser(params)
* Connection.awaitCommit()
* Connection.awaitQuery(query[, params])
* Connection.awaitRollback()

## Configuration:

### Example JSON configuration

```json
{
  "connectionLimit" : 10,
  "host"            : "example.org",
  "user"            : "bob",
  "password"        : "secret",
  "database"        : "my_db"
}
```

## Example JavaScript

```javascript
const fs = require(`fs`);
const mysql = require(`mysql-await`);

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

```

## Example Output 

```console
Connection 218 connected
Connection 218 acquired
[ RowDataPacket {
    id: 56,
    account: 3,
    commission: 7,
    date: 2018-05-17T07:00:00.000Z,
    price: 146.71,
    shares: 20,
    ticker: 'DE',
    type: 1 },
  RowDataPacket {
    id: 112,
    account: 3,
    commission: 7,
    date: 2018-05-21T07:00:00.000Z,
    price: 158.83,
    shares: -20,
    ticker: 'DE',
    type: 2 } ]
Connection 218 released
Connection 218 acquired
Connection 218 released
[ RowDataPacket {
    id: 17,
    account: 1,
    commission: 7,
    date: 2017-11-09T08:00:00.000Z,
    price: 38.23,
    shares: 100,
    ticker: 'KSS',
    type: 1 },
  RowDataPacket {
    id: 18,
    account: 1,
    commission: 7,
    date: 2017-11-10T08:00:00.000Z,
    price: 42.6,
    shares: -100,
    ticker: 'KSS',
    type: 2 } ]
Connection 218 acquired
Connection 218 released
```
  
## Not Currently Supported

* Pool Cluster's -- for now, can be added later if needed
* Result streams -- for now, can be added later if needed

## Contributing

* Please open issue for any bugs found or feature requests

## License

MIT
