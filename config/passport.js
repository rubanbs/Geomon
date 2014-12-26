var app = require('../app')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.passport = passport

var User = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
function (req, email, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function () {

        User.findOne({ 'email': email }, function (err, user) {

            if (err) return done(err);

            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else if (password !== req.body.confirm) {
                return done(null, false, req.flash('signupMessage', 'Passwords must match.'));
            } else {
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.name = req.body.name ? req.body.name : '[name]';
                newUser.save(function (err) {
                    if (err) throw err;
                    return done(null, newUser);
                })
            }
        })
    })
}))

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
function (req, email, password, done) {

    User.findOne({ 'email': email }, function (err, user) {

        if (err) return done(err);

        if (!user)
            return done(null, false, req.flash('loginMessage', 'No user found.'))

        if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Wrong password.'))

        return done(null, user)
    })
}))

app.isAuthenticated = function (req, res, next) {

    if (req.isAuthenticated())
        return next()

    res.redirect('/')
}

module.exports = passport