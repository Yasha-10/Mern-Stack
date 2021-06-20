const HttpError = require('../utils/http-error');
const bcrypt = require('bcryptjs');
const Admin = require('../model/admin');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

//const dotenv = require('dotenv');
//const SendOtp = require('sendotp');
//dotenv.config();
const adminSignup = async(req, res, next) => {
    const {
        firstname,
        lastname,
        email,
        password,
        role
    } = req.body;

    //existing user
    let existingAdmin;
    try {
        existingAdmin = await Admin.findOne({
            email: email
        });
    } catch (err) {
        const error = new HttpError("signup failed. Please try later.", 500);
        return next(error);
    }

    if (existingAdmin) {
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
    const createdAdmin = new Admin({
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: hashedPassword,
        role: 'Admin'
    });

    try {
        await createdAdmin.save();

    } catch (err) {
        const error = new HttpError("Signup failed", 500);
        return next(error);
    }



    let token;
    try {
        token = jwt.sign({
            adminId: createdAdmin.id,
            email: createdAdmin.email
        }, "adminSecretKey", {
            expiresIn: "2h"
        });


    } catch (err) {
        const error = new HttpError("Login failed. Please try later.", 403);
        return next(error);
    }

    return res.json({
        'adminId': createdAdmin.id,
        'email': createdAdmin.email,
        'token': token
    });
}


const adminLogin = async(req, res, next) => {

    const {
        email,
        password
    } = req.body;

    let existingAdmin;

    try {
        existingAdmin = await Admin.findOne({
            email: email
        });
    } catch (err) {
        const error = new HttpError("Login failed, please try later.", 500);
        return next(error);
    }

    if (!existingAdmin) {
        const error = new HttpError("Invalid credentials", 403);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingAdmin.password);
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
            adminId: existingAdmin.id,
            email: existingAdmin.email
        }, "adminSecretKey", {
            expiresIn: "2h"
        });

    } catch (err) {
        const error = new HttpError("Login failed. Please try later.", 403);
        return next(error);
    }

    res.status(200).json({
        'adminId': existingAdmin.id,
        'FirstName': existingAdmin.firstName,
        'LastName': existingAdmin.lastName,
        'Email': existingAdmin.email,
        'Role': existingAdmin.role,
        'Token': token
    });


}


const deleteUser = async(req, res, next) => {

    const {
        email
    } = req.body
    let existingUser;
    try {
        existingUser = await User.findOne({
            email: email
        });
    } catch (err) {
        const error = new HttpError('User Deletion Failed', 500);
        return next(error);
    }

    if (existingUser) {
        return User.deleteOne({
            email: email
        }).then(() => {
            res.status(200).json({
                message: "User Deleted"
            })
        }).catch(err => {
            const error = new HttpError('User Already Deleted', 500);
            return next(error);
        })
    }

    if (!existingUser) {
        return res.status(200).json({
            "User Does Not Exist": 500
        })
    }



}




exports.adminSignup = adminSignup;
exports.adminLogin = adminLogin;
exports.deleteUser = deleteUser;