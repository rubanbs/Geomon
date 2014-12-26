var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongostore')(session);
var app = module.exports = express();
var expressLayouts = require('express-ejs-layouts');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var configdb = require('./config/database.js');
var passport = require('./config/passport')

var main = require('./routes/mainRoute');
var user = require('./routes/userRoute');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts)

//app.use(session({ secret: 'secret string' }));
app.use(session({
    secret: 'secret string',
    cookie: {
        maxAge: 36000000
    },
    store: new MongoStore({
        'db': 'sessions'
    })
}));
mongoose.connect(configdb.url);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

// view engine setup
app.set('views', 'views');
app.set('view engine', 'ejs');
app.set('layout', '_layout');

app.use('/', main);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log(err)
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
