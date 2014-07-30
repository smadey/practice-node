var mongoskin = require('mongoskin');

exports.port = 18080;

exports.cookieSecret = 'todo';

exports.dbUrl = 'mongo://sa:sa@localhost:27017/todo'

exports.db = mongoskin.db(exports.dbUrl);