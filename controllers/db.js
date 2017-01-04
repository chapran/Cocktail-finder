var mongoose = require('lib/mongoose'),
    db = mongoose.connection.db;

module.exports = function (app) {
    app.get('/getcollection', function (req, res) {
            var collection = db.collection('cocktails').find(),
                cocktails = collection.toArray(function (err, result){
                    res.send(result);
                    res.end();
                });
    });

    app.get('/search', function(req, res){
        var foundCocktails = [],
            searchFields = ['name', 'glass', 'ingredients.ingr', 'search_categories.cocktailType', 'search_categories.baseSpirit'];
        searchFields.forEach(function (field) {
            db.collection('cocktails').find({field: req.query.search}).toArray(function (err, result) {
                foundCocktails.push(result);
                res.end();
        })
        });
    })
};
