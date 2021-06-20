const HttpError = require('../utils/http-error');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Blog = require('../model/blog');
const jwt = require('jsonwebtoken');

const userSignup = async(req, res, next) => {

    const {
        firstname,
        lastname,
        email,
        password,
        role
    } = req.body;

    //existing user
    let existingUser;
    try {
        existingUser = await User.findOne({
            email: email
        });
    } catch (err) {
        const error = new HttpError("signup failed. Please try later.", 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError("Email already in use.", 422);
        return next(error);
    }

    //Encrypt password

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Password encryption failed.", 500);
        return next(error);
    }


    //user creation
    const createdUser = new User({
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: hashedPassword,
        role: 'User'
    });

    try {
        await createdUser.save();

    } catch (err) {
        const error = new HttpError("Signup failed", 500);
        return next(error);
    }



    let token;
    try {
        token = jwt.sign({
            userId: createdUser.id,
            email: createdUser.email
        }, "userSecretKey", {
            expiresIn: "2h"
        });
    } catch (err) {
        const error = new HttpError("Login failed. Please try later.", 403);
        return next(error);
    }

    return res.json({
        'userId': createdUser.id,
        'email': createdUser.email,
        'token': token
    });
}


const userLogin = async(req, res, next) => {

    const {
        email,
        password
    } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({
            email: email
        });
    } catch (err) {
        const error = new HttpError("Login failed, please try later.", 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError("Invalid credentials", 403);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError("Invalid credentials", 403);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError("Invalid credentials", 403);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email
        }, "userSecretKey", {
            expiresIn: "2h"
        });


    } catch (err) {
        const error = new HttpError("Login failed. Please try later.", 403);
        return next(error);
    }

    res.status(200).json({
        'UserId': existingUser.id,
        'FirstName': existingUser.firstName,
        'LastName': existingUser.lastName,
        'Email': existingUser.email,
        'Role': existingUser.role,
        'Token': token
    });

    console.log(existingUser.id);


}

const getInfo = async(req, res, next) => {
    const {
        email
    } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({
            email: email
        });
    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500);
        return next(error);
    }

    if (!existingUser) {
        return res.status(200).json({
            "User Does Not Exist": 500
        })
    }

    if (existingUser) {
        return res.status(200).json({
            "FirstName": existingUser.firstName,
            "LastName": existingUser.lastName,
            "email": existingUser.email,
            "Role": existingUser.role,
            "DateOfBirth": existingUser.DOB
        });
    }
}


let postBlog = async(req, res, next) => {

    const {
        userId,
        heading,
        body
    } = req.body;

    let existingId
    try {
        existingId = await Blog.findOne({
            userId: userId
        });
    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500);
        return next(error);
    }
    if (existingId) {
        return res.status(200).json("User Id Already Exist Try Different User Id");
    }
    const createBlog = new Blog({
        userId: userId,
        heading: heading,
        body: body
    });

    try {
        await createBlog.save();
        return res.status(200).json({
            message: "Blog Created"
        });
    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500);
        return next(error);
    }
}

let getBlog = async(req, res, next) => {
    const {
        userId,
        heading,
        body
    } = req.body;

    let existingBlog;
    try {
        existingBlog = await Blog.find({
            $or: [{
                heading: {
                    '$regex': heading
                }
            }]
        }, (err, result) => {
            if (err) {
                throw err;
            } else {
                return res.status(200).json(result);
            }
        });
    } catch (err) {
        const error = new HttpError('Something Went Wrong', 500);
        return next(error);
    }
    if (!existingBlog) {
        return res.status(200).json({
            message: "User Blog Does Not Exist Kindly Check Again"
        });
    }
}

exports.userSignup = userSignup;
exports.userLogin = userLogin;
exports.getInfo = getInfo;
exports.postBlog = postBlog;
exports.getBlog = getBlog;