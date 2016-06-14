var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var autoroute = require('express-autoroute');
var mongoose = require('mongoose');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('view cache');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(cookieParser('bestsecretever'));
app.use(express.static(path.join(__dirname, 'public')));

// mongoose.connect('mongodb://104.197.170.248/av-prod');
mongoose.connect('mongodb://iuliu:johnHancock84@ds015194.mlab.com:15194/heroku_0c2jjcr2');

app.use('/', require('./routes/index'));
app.use('/m', require('./routes/m'));
app.use('/manage', require('./routes/manage'));
app.use('/login', require('./routes/login'));

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
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
