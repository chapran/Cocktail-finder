var mongoose = require('mongoose'),
    config = require('../config');
mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoose: url'), config.get('mongoose: options'));

module.exports = mongoose;