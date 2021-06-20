const jwt = require('jsonwebtoken');

const HttpError = require('../utils/http-error');


module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            const error = new HttpError("Toke doen't exist, please try later", 403);
            return next(error);
        }
        let decodedToken = null;
        if (req.headers.role == "User") {
            decodedToken = jwt.verify(token, "userSecretKey");
        } else if (req.headers.role == "Admin") {
            decodedToken = jwt.verify(token, "adminSecretKey");
        }

        req.user = decodedToken;

        next();

    } catch (err) {
        const error = new HttpError("Error occured in middleware, please try later", 403);
        return next(error);
    }

}