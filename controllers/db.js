var mongoose = require('lib/mongoose'),
    Cocktail = require('../models/cocktailsModel').Cocktail,
    db = mongoose.connection.db;

module.exports = function (app) {
    app.get('/getcollection/', function (req, res) {
        var collection = db.collection('cocktails').find();
        collection.toArray(function (err, result) {
            res.send(result);
            res.end();
        });
    });

    app.get(/categories/, function (req, res) {
        var pathArray = decodeURIComponent(req.path).split('/'),
            path;
        if(pathArray[3] === 'no-alc'){
            path = JSON.parse('{\"search_categories.baseSpirit\": \"-\"}')
        } else{
            path = JSON.parse('{\"search_categories.' + pathArray[3] + '\": \"' + pathArray[4] + '\"}')
        }
            var collection = db.collection('cocktails').find(path);
        console.log(path);

        collection.toArray(function (err, result) {
            res.send(result);
            res.end();
        });
    });

    app.get('/search', function (req, res) {
        var queryString = new RegExp(req.query.search, 'i'),
            foundByField = Cocktail.find().or([
                {'name': queryString},
                {'glass': queryString},
                {'ingredients.ingr': queryString},
                {'search_categories.cocktailType': queryString},
                {'search_categories.baseSpirit': queryString}
            ]);
        foundByField.lean().exec(function (err, result) {
            res.send(result);
            res.end();
        });
    })
};
