var fs = require('fs');

module.exports = function (app) {
    app.get('/', function (req, res) {
        var file = new fs.ReadStream('public/index.html');
        sendFile(file, res);
    });
};

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