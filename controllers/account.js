var User = require('../models/user').User,
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    log = require('../lib/log')(module);

module.exports = function (app) {

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'login_password'
        },
        function(username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    debugger;
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.checkPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        }
    ));

    var auth = function (req, res, next) {
        if (!req.isAuthenticated())
            res.sendStatus(401);
        else
            next();
    };

    app.post('/login', passport.authenticate('local'), function (req, res) {
        res.statusCode = 200;
        res.send({status: 'OK'});
        res.end();
    });

    // app.post('/', function (req, res, next) {
    //     var username = req.body.username,
    //         password = req.body.login_password;
    //     User.findOne({username: username}, function (err, user) {
    //         if (err) return next(err);
    //         if (user) {
    //             if (user.checkPassword(password)) {
    //                 res.statusCode = 200;
    //                 res.send({status: 'OK'});
    //                 res.end();
    //             }
    //             else {
    //                 res.statusCode = 401;
    //                 res.send({status: 'error', fieldError: 'Incorrect password'});
    //                 res.end();
    //             }
    //         }
    //         else {
    //             res.statusCode = 401;
    //             res.send({status: 'error', fieldError: 'No such username found'});
    //             res.end();
    //         }
    //     })
    // });

    app.post('/register', function (req, res, next) {
        var user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        user.save(function (err) {
            if (err) return next(err);
            req.login(user, function(err) {
                if (err) { return next(err); }
                res.statusCode = 200;
                res.end();
            });
        })
    });

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id }, function(err, user){
            err
                ? done(err)
                : done(null, user);
        });
    });

    app.post('/logout', function (req, res) {
        req.logOut();
        res.sendStatus(200);
    });


    app.get('/check_auth', auth, function (req, res) {
        var param = req.query.name;
        log.info(param);
        res.sendStatus(200);
    });
};
