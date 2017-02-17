var auth = function (req, res, next) {
    if (!req.user) {
        res.send({status: 'not registered'});
        res.end();
    } else
        next();
};

module.exports = auth;