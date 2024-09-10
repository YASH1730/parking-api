const knex = require('knex')

const knexFile = require('../knexfile');

const env = 'production';

const options =knexFile[env];


module.exports =knex.knex(options);