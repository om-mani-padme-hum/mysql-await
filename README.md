# MySQL Async/Await Wrapper v2.1.6

Simple wrapper for MySQL async/await functionality.  Intended for functionality to mimic the popular [mysql](https://github.com/mysqljs/mysql) Node.js callback-based package, but with additional methods for awaiting execution.  Goal is for normal methods to be unaffected and only additional await methods added, though accomplished through intermediary class objects.

* [Installation](#installation)
* [Provided Async/Await Methods](#provided-asyncawait-methods)
* [Configuration](#configuration)
* [Example Using Single Connection](#example-using-single-connection)
* [Example Using Connection Pool](#example-using-connection-pool)
* [Fringe Features Not Currently Support](#fringe-features-not-currently-supported)
* [Contributing](#contributing)
* [License](#license)

## Installation

```console
npm i mysql-await
```

## Provided Async/Await Methods

The methods below have been added as async/await wrappers to existing MySQL methods of similar name.  In order to use them, simply "await" their execution rather than passing a callback for the last argument of the function call.  For original methods for which "await" methods may have been added, as needed, see the [mysql](https://github.com/mysqljs/mysql) library.

### Connections from mysql.createConnection()

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

## Example Using Single Connection

```javascript
const fs = require(`fs`);
const mysql = require(`mysql-await`);

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
  
  /** End the connection */
  connection.awaitEnd();
})();

```

### Example Output

```console
[
  RowDataPacket { id: 3, firstName: 'Jane', lastName: 'Doe', age: 45 }
]
```

## Example Using Connection Pool

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
  let result = await connection.awaitQuery(`SELECT * FROM people WHERE lastName = ?`, [`Smith`]);
  
  /** Log output */
  console.log(result);
  
  /** Release connection */
  connection.release();
    
  /** Perform query on pool (opens a connection, runs query, releases connection) */
  result = await pool.awaitQuery(`SELECT * FROM people WHERE age = ?`, [45]);
  
  /** Log output */
  console.log(result);
  
  /** Get a new connection from the pool */
  const connection2 = await pool.awaitGetConnection();
  
  /** Begin a new transaction */
  await connection2.awaitBeginTransaction();
  
  /** Perform query for max id number in users table */
  result = await connection2.awaitQuery(`SELECT MAX(id) maxId FROM people`);
  
  /** Add one to max id to get new id number */
  const newId = result[0].maxId + 1;
  
  /** Insert new test user with new id number */
  await connection2.awaitQuery(`INSERT INTO people (id, firstName, lastName, age) VALUES (?, ?, ?, ?)`, [newId, `Jacob`, `Marley`, 147]);
  
  /** Commit transaction */
  await connection2.awaitCommit();
  
  /** Release connection */
  connection2.release();
  
  /** Close connection pool */
  await pool.awaitEnd();
})();
```

### Example Output 

```console
Connection 16 connected
Connection 16 acquired
[
  RowDataPacket {
    id: 2,
    firstName: 'John',
    lastName: 'Smith',
    age: 37
  }
]
Connection 16 released
Connection 16 acquired
Connection 16 released
[
  RowDataPacket { id: 3, firstName: 'Jane', lastName: 'Doe', age: 45 }
]
Connection 16 acquired
Connection 16 released
```
  
## Fringe Features Not Currently Supported

* Pool Cluster's -- for now, can be added later if needed
* Result Streams -- for now, can be added later if needed

## Contributing

Please open an issue for any bugs found or feature requests

* Thanks, @DavidvanDriessche, for identifying a significant issue with error handling

## License

MIT
