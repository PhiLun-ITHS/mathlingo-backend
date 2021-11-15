const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const db = require("../../database/database.js");
const UserService = require('../../services/user_service');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post("/login", async (req, res, next) => {
    let errors = [];
    if (!req.body.email) {
        errors.push("No email");
    }
    if (!req.body.password) {
        errors.push("No Password");
    }
    if (errors.length != 0) {
        res.status(400).json({errors});
    }
    else {
        let tokens = await UserService.login(req.body.email, req.body.password);
        if (!tokens) {
            res.status(403).send("Wrong Email or Password")
        }
        let accessToken = tokens[0];
        let refreshToken = tokens[1];

        res.send({accessToken, refreshToken});
    }
});

router.post("/logout", async (req, res, next) => {
    if (!req.body.token) {
        res.status(400).json("Invalid Token");
    }
    else {
        let user = await UserService.logout(req.body.token);
        if (!user) {
            res.status(401).send('Failed to Sign Out');
        }
        else {
            res.send('Signed out ' + user.name);
        }
    }
})


router.post("/signup", async (req, res, next) => {
    let errors=[];
    if (!req.body.name) {
        errors.push("No Username");
    } if(!req.body.email) {
        errors.push("No Email");
    } if (!req.body.password) {
        errors.push("No Password");
    }
    if (errors.length != 0) {
        res.status(400).json({errors});
    }
    else {
        let newUser = await UserService.addUser(req.body.name, req.body.email, req.body.password);
        if (newUser != null) {
            res.send(newUser);
        }
        else {
            res.status(403).send("Email already registered")
        }
    }
});

router.post("/token", async (req, res) => {
    if (req.body.token == null) {
        res.status(401);
    }
    const refreshToken = req.body.token;
    const newAccessToken = await UserService.newAccessToken(refreshToken);
    if (!newAccessToken) {
        res.status(401).send("Unable to obtain access token")
    }
    else {
        res.send(newAccessToken);
    }
    
})

module.exports = router;