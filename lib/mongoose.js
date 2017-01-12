var mongoose = require('mongoose'),
    config = require('../config'),
    uri;

if(process.env.NODE_ENV == 'development') {uri = config.get('mongoose:uri')}
else if(process.env.NODE_ENV == 'production') {uri = process.env.MONGODB_URI;}
mongoose.Promise = global.Promise;
mongoose.connect(uri, config.get('mongoose:options'));

module.exports = mongoose;