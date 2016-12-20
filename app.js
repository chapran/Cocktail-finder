var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    log = require('./libs/log')(module),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    config = require('./config');

var app = express();

app.use(favicon(__dirname + '/public/img/favicon.ico')); // favicon
app.use(bodyParser()); //req.body
app.use(cookieParser()); //req.cookies

if(app.get('env') == 'development'){  //logger
    app.use(logger('dev'));
} else app.use(logger('default'));


app.use(express.static(__dirname + '/public')); //static dirname for public files
app.get('/',function(req, res){
    var file = new fs.ReadStream('index.html');
    sendFile(file, res);
});

http.createServer(app).listen(config.get('port'), function () {  //creating the server
    log.info("server listening on port " + config.get('port'))
});

function sendFile(file, res) {
    file.pipe(res);

    file.on('error', function (err) {
        res.statusCode = 500;
        res.end("Server Error");
        console.error(err);
    });

    res.on('close', function () {
        file.destroy();
    });
}
// app.use(function (err, req, res, next) {
//     if(app.get('env') == 'development') {
//         err.message = "Not Found";
//         res.status(404).render({error: err});
//     } else res.send(500);
// });
