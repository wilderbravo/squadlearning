import { development } from '../knexfile.js';
module.exports = require('knex')(development);

// module.exports = require('knex')(development[process.env.NODE_ENV]);