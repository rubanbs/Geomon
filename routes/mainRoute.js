var express = require('express');
var app = require('../app')
var router = express.Router();

router.get('/', authInfo, function (req, res) {
    res.render('main/home', { loginMessage: req.flash('loginMessage') });
})

router.get('/license', authInfo, function (req, res) {
    res.render('main/license');
})

router.post('/signin', app.passport.authenticate('local-login', {
    successRedirect: '/user',
    failureRedirect: '/',
    failureFlash: true
}))

router.get('/signout', function (req, res) {
    req.logout()
    res.redirect('/')
})

router.get('/signup',
    function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        }
        next();
    },
    function (req, res) {
        res.render('main/signup', { signupMessage: req.flash('signupMessage') });
    })

router.post('/signup',
    function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        }
        next();
    }, app.passport.authenticate('local-signup', {
        successRedirect: '/user',
        failureRedirect: '/signup',
        failureFlash: true
    }))

function authInfo(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user.name;
    }
    next();
}

module.exports = router;