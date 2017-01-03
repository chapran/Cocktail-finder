var Cocktail = require('../models/cocktailsModel').Cocktail,
    multer = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads')
        },
        filename: function (req, file, cb) {
            var tmp = file.originalname.split('.');
            cb(null, file.fieldname + '-' + Date.now() + '.' + tmp[tmp.length - 1])
        }
    }),
    upload = multer({storage: storage});

module.exports = function (app) {
    app.post('/add_cocktail', upload.single('image'), function (req, res) {
        saveToDB(req, res);
    });
};

function saveToDB(req, res) {
    req.body.image = req.file.path;
    var cocktailData = req.body,
        cocktail = new Cocktail(cocktailData);
    cocktail.save(function (err) {
        if (err) return next(err);
        res.end();
    });
}