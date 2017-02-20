var Cocktail = require('../models/cocktailsModel').Cocktail,
    multer = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/img/uploadedCocktails')
        },
        filename: function (req, file, cb) {
            var tmp = file.originalname.split('.');
            cb(null, file.fieldname + '-' + Date.now() + '.' + tmp[tmp.length - 1])
        }
    }),
    upload = multer({storage: storage});

module.exports = function (app) {
    app.post('/add_cocktail', upload.single('image'), function (req, res) {
        // saveToDB(req, res);
        console.log(req.body)
    });
};

function saveToDB(req, res, next) {
    req.body.image = 'img/uploadedCocktails/' + req.file.filename;
    console.log(req.body.image);
    var cocktailData = req.body,
        cocktail = new Cocktail(cocktailData);
    cocktail.save(function (err) {
        if (err) return next(err);
        res.statusCode = 200;
        res.end();
    });
}

// {
//     name: cocktailData.name,
//         image: cocktailData.image,
//     glass: cocktailData.glass
// });
// cocktail.about.push(cocktailData.about);
// cocktail.details.push(cocktailData.details);
// cocktail.ingredients.push({
//     ingr: cocktailData.ingredients[0]['ingr'],
//     quantity: cocktailData.ingredients[0]['quantity']
// }