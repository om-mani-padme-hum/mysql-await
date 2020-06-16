/** Require external modules */
const mysql = require(`mysql`);

/**
 * @class mysqlAwait.ConnectionAwait
 * @description Async/await version of MySQL Connection object
 */
class ConnectionAwait {
  /**
   * @signature new Connection()
   * @returns Connection
   * @description Creates a new MySQL connection.
   */
  constructor() {
    this.connection = mysql.createConnection(...arguments);
    this.config = this.connection.config;
    this.inTransaction = false;
  }
  
  
  /**
   * @signature awaitBeginTransaction()
   * @returns Promise
   * @description Begin a new transaction.
   */
  awaitBeginTransaction() {
    return new Promise((resolve, reject) => {
      this.connection.beginTransaction((err) => {
        if ( err )
          return reject(err);

        this.inTransaction = true;
        resolve();
      });
    });
  }
  
  /**
   * @signature awaitChangeUser(params)
   * @param params Object First argument of MySQL's Connection.changeUser()
   * @returns Promise
   * @description Change the current user without shutting down socket.
   */
  awaitChangeUser(params) {
    return new Promise((resolve, reject) => {
      this.connection.changeUser(params, (err) => {
        if ( err )
          return reject(err);

        resolve();
      });
    });
  }
  
  /**
   * @signature awaitCommit()
   * @returns Promise
   * @description Commit a transaction.
   */
  awaitCommit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err) => {
        if ( err ) {
          if ( this.inTransaction ) {
            this.connection.rollback(() => {
              this.inTransaction = false;
              reject(err);
            });
          } else {
            this.inTransaction = false;
            reject(err);
          }
        } else {
          this.inTransaction = false;
          resolve();
        }
      });
    });
  }
  
  /**
   * @signature awaitConnect()
   * @returns Promise
   * @description Establishes a connection to the database.
   */
  awaitConnect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if ( err )
          return reject(err);

        resolve();
      });
    });
  }
  
  /**
   * @signature awaitDestroy()
   * @returns Promise
   * @description Destroys the connection.
   */
  awaitDestroy() {
    return new Promise((resolve, reject) => {
      this.connection.destroy((err) => {
        if ( err )
          return reject(err);

        resolve();
      });
    });
  }
  
  /**
   * @signature awaitEnd()
   * @returns Promise
   * @description Terminates the connection.
   */
  awaitEnd() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if ( err )
          return reject(err);

        resolve();
      });
    });
  }
  
  /**
   * @signature awaitQuery(query[, params])
   * @param query string First argument of MySQL's Connection.query()
   * @param params Array (optional) Second argument of MySQL's Connection.query() if not used for callback
   * @returns Promise
   * @description Queries the MySQL database, returning a [Promise] that resolves when finished or rejects on error.  
   */
  awaitQuery(query, params) {
    return new Promise((resolve, reject) => {
      if ( typeof params === `undefined` ) {
        this.connection.query(query, (err, result) => {
          if ( err ) {
            if ( this.inTransaction ) {
              this.connection.rollback(() => {
                this.inTransaction = false;
                reject(err);
              });
            } else {
              reject(err);
            }
          } else {
            resolve(result);
          }
        });
      } else {
        this.connection.query(query, params, (err, result) => {
          if ( err ) {
            if ( this.inTransaction ) {
              this.connection.rollback(() => {
                this.inTransaction = false;
                reject(err);
              });
            } else {
              reject(err);
            }
          } else {
            resolve(result);
          }
        });
      }
    });
  }
  
  /**
   * @signature awaitRollback()
   * @returns Promise
   * @description Rolls back a transaction.
   */
  awaitRollback() {
    return new Promise((resolve, reject) => {
      this.connection.rollback(() => {
        resolve();
      });
    });
  }
  
  /**
   * @signature beginTransaction()
   * @description Pass along functionality of the beginTransaction method.
   */
  beginTransaction() {
    return this.connection.beginTransaction(...arguments);
  }
  
  /**
   * @signature changeUser()
   * @description Pass along functionality of the changeUser method.
   */
  changeUser() {
    return this.connection.changeUser(...arguments);
  }
  
  /**
   * @signature commit()
   * @description Pass along functionality of the commit method.
   */
  commit() {
    return this.connection.commit(...arguments);
  }
  
  /**
   * @signature connect()
   * @description Pass along functionality of the connect method.
   */
  connect() {
    return this.connection.connect(...arguments);
  }
  
  /**
   * @signature destroy()
   * @description Pass along functionality of the destroy method.
   */
  destroy() {
    return this.connection.destroy(...arguments);
  }
  
  /**
   * @signature end()
   * @description Pass along functionality of the end method.
   */
  end() {
    return this.connection.end(...arguments);
  }
  
  /**
   * @signature escape(data)
   * @description Pass along functionality of escape.
   */
  escape() {
    return this.connection.escape(data);
  }
  
  /**
   * @signature escapeId(data)
   * @description Pass along functionality of escapeId.
   */
  escapeId() {
    return this.connection.escapeId(data);
  }
  
  /**
   * @signature on()
   * @description Pass along functionality of event listeners.
   */
  on() {
    return this.connection.on(...arguments);
  }
  
  /**
   * @signature query()
   * @description Pass along functionality of the query method.
   */
  query() {
    return this.connection.query(...arguments);
  }
  
  /**
   * @signature rollback()
   * @description Pass along functionality of the rollback method.
   */
  rollback() {
    return this.connection.rollback(...arguments);
  }
}

/**
 * @class mysqlAwait.PoolAwait
 * @description Async/await version of MySQL Pool object
 */
class PoolAwait {
  /**
   * @signature new Pool()
   * @returns Pool
   * @description Creates a new MySQL connection pool.
   */
  constructor() {
    this.pool = mysql.createPool(...arguments);
  }
  
  /**
   * @signature awaitEnd()
   * @returns Promise
   * @description Closes all connections in the pool and ends the pool.
   */
  awaitEnd() {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if ( err )
          return reject(err);

        resolve();
      });
    });
  }
  
  
  /**
   * @signature awaitGetConnection()
   * @returns Promise
   * @description Get a new MySQL connection from the pool.  This will need to be released by
   * you when you are done using it.
   */
  awaitGetConnection() {
    return new Promise(async (resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if ( err )
          return reject(err);

        connection.inTransaction = false;

        /**
         * @signature awaitBeginTransaction()
         * @returns Promise
         * @description Begin a new transaction.
         */
        connection.awaitBeginTransaction = function () {
          return new Promise((resolve, reject) => {
            this.beginTransaction((err) => {
              if ( err )
                return reject(err);

              this.inTransaction = true;
              resolve();
            });
          });
        }

        /**
         * @signature awaitChangeUser(params)
         * @param params Object First argument of MySQL's Connection.changeUser()
         * @returns Promise
         * @description Change the current user without shutting down socket.
         */
        connection.awaitChangeUser = function (params) {
          return new Promise((resolve, reject) => {
            this.changeUser(params, (err) => {
              if ( err )
                return reject(err);

              resolve();
            });
          });
        }

        /**
         * @signature awaitCommit()
         * @returns Promise
         * @description Commit a transaction.
         */
        connection.awaitCommit = function () {
          return new Promise((resolve, reject) => {
            this.commit((err) => {
              if ( err ) {
                if ( this.inTransaction ) {
                  this.connection.rollback(() => {
                    this.inTransaction = false;
                    reject(err);
                  });
                } else {
                  this.inTransaction = false;
                  reject(err);
                }
              } else {
                this.inTransaction = false;
                resolve();
              }
            });
          });
        };

        /**
         * @signature awaitQuery(query[, params])
         * @param query string First argument of MySQL's Connection.query()
         * @param params Array (optional) Second argument of MySQL's Connection.query() if not used for callback
         * @returns Promise
         * @description Queries the MySQL database, returning a [Promise] that resolves when finished or rejects on error.  
         */
        connection.awaitQuery = function (query, params) {
          return new Promise((resolve, reject) => {
            if ( typeof params === `undefined` ) {
              this.query(query, (err, result) => {
                if ( err )
                  return reject(err);

                resolve(result);
              });
            } else {
              this.query(query, params, (err, result) => {
                if ( err ) {
                  if ( this.inTransaction ) {
                    this.rollback(() => {
                      this.inTransaction = false;
                      reject(err);
                    });
                  } else {
                    reject(err);
                  }
                } else {
                  resolve(result);
                }
              });
            }
          });
        };

        /**
         * @signature awaitRollback()
         * @returns Promise
         * @description Rolls back a transaction.
         */
        connection.awaitRollback = function () {
          return new Promise((resolve, reject) => {
            this.rollback(() => {
              resolve();
            });
          });
        };

        resolve(connection);
      });
    });
  };
  
  /**
   * @signature awaitQuery(query[, params])
   * @param query string First argument of MySQL's Pool.query()
   * @param params Array (optional) Second argument of MySQL's Pool.query() if not used for callback
   * @returns Promise
   * @description Queries the MySQL database, returning a [Promise] that resolves when finished or rejects on error.  
   */
  awaitQuery(query, params) {
    return new Promise((resolve, reject) => {
      try {
        if ( typeof params === `undefined` ) {
          this.pool.query(query, (err, result) => {
            if ( err )
              return reject(err);

            resolve(result);
          });
        } else {
          this.pool.query(query, params, (err, result) => {
            if ( err )
              return reject(err);

            resolve(result);
          });
        }
      } catch ( err ) {
        reject(err);
      }
    });
  }
  
  /**
   * @signature end()
   * @description Pass along functionality of the end method.
   */
  end() {
    return this.pool.end(...arguments);
  }
  
  /**
   * @signature getConnection()
   * @description Pass along functionality of the getConnection method.
   */
  getConnection() {
    return this.pool.getConnection(...arguments);
  }
  
  /**
   * @signature on()
   * @description Pass along functionality of event listeners.
   */
  on() {
    return this.pool.on(...arguments);
  }
  
  /**
   * @signature awaitQuery()
   * @description Pass along functionality of the pool query method.
   */
  query() {
    return this.pool.query(...arguments);
  }
}

/**
 * @class mysqlAwait.MySQLAwait
 * @author Rich Lowe
 * @copyright 2019 Rich Lowe
 * @description Class for establishing and querying MySQL connections.
 */
class MySQLAwait {
  /**
   * @signature createConnection(data)
   * @description Intercept creating of MySQL connection and use our own object instead.
   */
  createConnection() {
    return new ConnectionAwait(...arguments);
  }
  
  /**
   * @signature createPool(data)
   * @description Intercept creating of MySQL connection pool and use our own object instead.
   */
  createPool() {
    return new PoolAwait(...arguments);
  }
  
  /**
   * @signature format(data)
   * @description Pass along functionality of format.
   */
  format() {
    return mysql.format(...arguments);
  }
}

module.exports = new MySQLAwait();
