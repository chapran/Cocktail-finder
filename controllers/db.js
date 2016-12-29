var mongoose = require('lib/mongoose');

module.exports = function (app) {
    app.get('/getcollection', function (req, res) {
            var db = mongoose.connection.db,
                collection = db.collection('cocktails').find(),
                cocktails = collection.toArray(function (err, result){
                    res.send(result);
                    res.end();
                });
    });
};
