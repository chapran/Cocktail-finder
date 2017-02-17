var User = require('../models/user').User,
    Cocktail = require('../models/cocktailsModel').Cocktail,
    passport = require('passport'),
    log = require('../lib/log')(module),
    mongoose = require('../lib/mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    auth = require('../lib/auth');

module.exports = function (app) {
    app.post('/toggle_favorites', auth, function (req, res) {
        User.findOne({_id: new ObjectId(req.session.passport.user)}, function (err, user) {
            if (err) res.sendStatus(500);

            if (!~user.favorites.indexOf(req.body.cocktail)) {
                console.log('no cocktails here');
                user.favorites.push(req.body.cocktail);
                user.save(function (err) {
                    if (err) res.send('problem with saving the cocktail');
                    res.send({status: 'successfully added'});
                })
            } else {
                user.favorites.splice(user.favorites.indexOf(req.body.cocktail), 1);
                user.save(function (err) {
                    if (err) res.send('problem with deleting the cocktail');
                    res.send({status: 'successfully deleted'});
                });
            }
        });
    });

    app.get('/check_if_favorite', auth, function (req, res) {
        User.findOne({_id: new ObjectId(req.session.passport.user)}, function (err, user) {
            if (err) res.sendStatus(500);

            if (!~user.favorites.indexOf(req.query.cocktail)) {
                res.send({isFavorite: false});
            } else {
                res.send({isFavorite: true});
            }
            res.end();
        });
    });

    app.get('/getFavoriteCocktails', auth, function (req, res) {
        User.findOne({_id: new ObjectId(req.session.passport.user)}, function (err, user) {
            if (err) res.sendStatus(500);

            var favoriteCocktailsIds = user.favorites.slice();

            Cocktail.find({_id: {$in: favoriteCocktailsIds}}, function (err, cocktails) {
                if (err) return false;
                else {
                    res.send(cocktails);
                    res.end();
                }
            })
        });
    })
};