var mongoose = require('lib/mongoose'),
    fs = require('fs'),
    async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers,
    createCocktailsCollection
], function (err) {
    console.log(arguments);
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('models/user');
    require('models/cocktailsModel');

    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {

    var users = [
        {firstname: 'Vasya', lastname: "B", email: 'example@', username: 'vasya', password: 'supervasya'},
        {firstname: 'Petya', lastname: "L", email: 'example@1', username: 'petya', password: '123'}
    ];

    async.each(users, function (userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}

function createCocktailsCollection(callback) {
    fs.readFile('public/db.json', function (err, data) {
        var parsedDB = JSON.parse(data.toString());

        async.each(parsedDB, function (cocktailData, callback) {
            var cocktail = new mongoose.models.Cocktail(cocktailData);
            cocktail.save(callback);
        }, callback);
    });
}