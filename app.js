var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    log = require('./lib/log')(module),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    config = require('./config'),
    session = require('express-session'),
    passport = require('passport');

var app = express();

app.use(favicon(__dirname + '/public/img/favicon.ico')); // favicon
app.use(bodyParser.urlencoded({extended: true})); //req.body
app.use(cookieParser()); //req.cookies
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

if(app.get('env') == 'development'){  //logger
    app.use(logger('dev'));
} else app.use(logger('default'));

app.use(express.static(__dirname + '/public')); //static dirname for public files

var mainController = require('./controllers'),
    accountController = require('./controllers/account'),
    dbController = require('./controllers/db');

mainController(app);
accountController(app);
dbController(app);

http.createServer(app).listen(config.get('port'), function () {  //creating the server
    log.info("server listening on port " + config.get('port'))
});

// app.use(function (err, req, res, next) {
//     if(app.get('env') == 'development') {
//         err.message = "Not Found";
//         res.status(404).render({error: err});
//     } else res.send(500);
// });
