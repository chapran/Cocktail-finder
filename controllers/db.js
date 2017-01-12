var mongoose = require('../lib/mongoose'),
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
    });

    app.get('/match_recipe', function (req, res) {
        var baseSpiritQuery,
            query = [];
        if(req.query.baseSpirit){
            var tmp;
            if(req.query.baseSpirit.indexOf('|') !== -1){
                tmp = decodeURIComponent(req.query.baseSpirit.split(' ').join(''))
            } else tmp = decodeURIComponent(req.query.baseSpirit);
            baseSpiritQuery = JSON.parse('{\"search_categories.baseSpirit\": \"' + tmp + '\"}')
        } else baseSpiritQuery = {};
        if(req.query.baseSpirit){
            query.push(baseSpiritQuery);
        }
        if(req.query.ingredients){
            req.query.ingredients.forEach(function (item) {
                query.push(JSON.parse('{\"ingredients.ingr\": \"' + item + '\"}'))
            });
        }

        var collection = Cocktail.find().and(query);
        collection.lean().exec(function (err, result) {
            res.send(result);
            res.end();
        });
    })
};
