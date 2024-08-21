// src/controllers/userController.js

const User = require("../model/user");
const logger = require('../utils/logger');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const config = require("../config/authConfig");


let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Replace with your SMTP server
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'genki@techmanager.io',
        pass: '12345!@#$%qwertQWERT'
    }
});

module.exports = {
    // 1. Fetch User Details
    fetchUserDetails: async (req, res) => {
        try {
            logger.info("in fetchUser details");
            const { mail } = req.body;
            const user = await User.find({ mail });
            logger.info("The user is", user);
            res.status(200).json(user);
        } catch (error) {
            logger.error("Error fetching user details:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // 2. Update User Details
    updateUserDetails: async (req, res) => {
        try {
            let filter;
            let update;
            const userid = req.query.userid;
            filter = { _id: userid };
            update = {
                name: req.query.data.name,
            };
            const UpdateUserInfo = await User.findByIdAndUpdate(filter, update);
            if (UpdateUserInfo) {
                return res.status(200).json({
                    message: 'success'
                });
            }
        } catch (error) {
            logger.error("Error updating user details:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // 4. Delete User (optional)
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.body;
            await User.deleteOne(userId);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            logger.error("Error deleting user:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    createUser: async (req, res) => {
        const { fullName, email, password, zipcode } = req.body;
        let existingUser;
        try {
            existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(200).json({ message: "exist" })
            }
        } catch (err) {
            console.log(err);
        }
        try {
            const hashedPassword = bcrypt.hashSync(password);
            const user = new User({
                fullName,
                email,
                password: hashedPassword,
                updatedDate: new Date(),
                zipcode
            });
            const newUser = await user.save();
            res.status(201).json(newUser);
        }
        catch (error) {
            logger.error("Error in createUserController:", error);
            res.status(500).json({ message: "Error creating user", error: error.message });
        }
    },

    signIn: async (req, res) => {
        const { email, password } = req.body;
        let existingUser;
        try {
            existingUser = await User.findOne({ email })
        } catch (err) {
            console.log(err);
        }
        if (!existingUser) {
            return res.status(200).json({ message: "nofound" })
        }
        if (existingUser.mailVerified == false) {
            const data = await User.findByIdAndDelete(existingUser._id);
            return res.status(200).json({ message: "nofound" })
        } else {
            const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
            if (!isPasswordCorrect) {
                return res.status(200).json({
                    message: "incorrectPassword",
                    accessToken: null,
                });
            }
            var token = jwt.sign({ id: existingUser._id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            let filter;
            let update;
            filter = { _id: existingUser._id };
            update = {
                token
            };
            const UpdateUserInfo = await User.findByIdAndUpdate(filter, update);
            if (UpdateUserInfo) {
                return res.status(200).json({
                    user: existingUser,
                    accessToken: token
                });
            } else {
                return res.status(500).json('server error');
            }
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const userData = await User.findOne({ email })
            if (!userData) {
                return res.status(200).json({ message: 'noUser' });
            }
            function generateHexObjectId() {
                return crypto.randomBytes(12).toString('hex'); // 12 bytes * 2 hex chars/byte = 24 characters
            }
            const secretKey = generateHexObjectId();
            let filter;
            let update;
            filter = { _id: userData._id };
            update = {
                recoveryPasscode: secretKey
            };
            const UpdateUserInfo = await User.findByIdAndUpdate(filter, update);
            if (UpdateUserInfo) {
                const recoverylink = `http://${process.env.NODE_ENV_SITE_DOMAIN}/reset-password/?userid=${UpdateUserInfo?._id}&secret=${secretKey}`;

                let mailOptions = {
                    from: '"Reply Genie" <noreply@replygenie.io>',
                    to: mail,
                    subject: 'Password recovery',
                    text: 'Password recovery',
                    html: `<div>If you want to reset your password, click the <a href=${recoverylink}>link.</a> Follow the instructions to reset your password and gain access to your account.</div>` // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    res.status(200).json({ message: "success" })
                });
            }
        } catch (error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: error.message });
            } else {
                logger.error('Error in checkVerificationStatus controller:', error);
                res.status(500).json({ error: 'Server error', details: error.message });
            }
        }
    },
    confirmForgetLink: async (req, res) => {
        const { _id, secret } = req.body;
        let data;
        try {
            data = await User.findOne({ _id })
        } catch (err) {
            res.status(500).json({ err: "Internal Server Error" });
        }
        console.log(data, 'data')
        if (data.recoveryPasscode == secret) {
            return res.status(200).json({ message: "success" })
        } else {
            return res.status(200).json({ message: "incorrect" })
        }
    },

    upgradePassword: async (req, res) => {
        const { _id, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password);
        try {
            data = await User.findOne({ _id });
        } catch (err) {
            res.status(500).json({ err: "Internal Server Error" });
        }
        if (data) {
            let filter;
            let update;
            filter = { _id: data._id };
            update = {
                password: hashedPassword
            };
            const UpdateUserInfo = await User.findByIdAndUpdate(filter, update);
            return res.status(201).json({ UpdateUserInfo })
        }
    },

};