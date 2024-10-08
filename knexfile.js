// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */


module.exports = {
  development: {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port : process.env.DB_PORT || 25060
    },
    migrations:{
      directory:'./migrations',
    },
    seeds:{directory:'./seeds'}
  },
  production: {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port : process.env.DB_PORT || 25060
    },
    migrations:{
      directory:'./migrations',
    },
    seeds:{directory:'./seeds'}
  }

};
