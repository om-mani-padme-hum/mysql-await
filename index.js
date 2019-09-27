/** Require external modules */
const mysql = require(`mysql`);

/**
 * @class ezobjects.MySQLConnection
 * @author Rich Lowe
 * @copyright 2018 Rich Lowe
 * @description Class for establishing and querying MySQL connections.
 */
class MySQLConnection {
  /**
   * @signature new MySQLConnection([data])
   * @param config Object
   * @returns MySQLConnection
   * @description Returns a new [MySQLConnection] instance and initializes using `config`, if provided, otherwise 
   * it initializes to defaults and will require a config to be set later.
   */
  constructor(config) {
    this.pool = mysql.createPool(config);
  }
  
  /**
   * @signature end()
   * @returns Promise
   * @description Closes all connections in the pool and ends the pool.
   */
  end() {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if ( err )
          reject(err);
        else
          resolve();
      });
    });
  }
  
  /**
   * @signature query(query, params)
   * @param query string Valid MySQL query
   * @param params Array Ordered array with values matching the parameters marked by `?` in the `query`
   * @returns Promise
   * @description Queries the MySQL database, returning a [Promise] that resolves when finished or rejects on error.  If the database has not
   * yet established a connection, it is automatically done prior to query execution.
   */
  query(query, params = []) {
    return new Promise(async (resolve, reject) => {
      /** Execute query and return result */
      try {
        this.pool.query(query, params, (err, result) => {
          if ( err )
            throw err;
          
          resolve(result);
        });
      } catch ( err ) {
        reject(err);
      }
    });
  }
}

module.exports = config => new MySQLConnection(config);
