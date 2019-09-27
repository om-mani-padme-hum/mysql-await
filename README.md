# MySQL Async/Await Wrapper v1.01

Basic API for performing async/await MySQL queries on a pool.  A new connection is created, queried, and released for each call to `query()`.

## Configuration:

### JavaScript

```javascript
{
  connectionLimit : 10,
  host            : 'example.org',
  user            : 'bob',
  password        : 'secret',
  database        : 'my_db'
}
```

### JSON

```json
{
  "connectionLimit" : 10,
  "host"            : "example.org",
  "user"            : "bob",
  "password"        : "secret",
  "database"        : "my_db"
}
```

## Example

```javascript
const fs = require(`fs`);
const mysql = require(`mysql-await`);

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

```

## Example Output 

```console
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
```
  
## License

MIT
