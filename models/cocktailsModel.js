var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    search_categories: {
        baseSpirit: [],
        cocktailType: []
    },
    name: String,
    image: String,
    about: [],
    ingredients: [
        {
            quantity: String,
            ingr: String
        }
    ],
    glass: String,
    details: []
});


exports.Cocktail = mongoose.model('Cocktail', schema);