'use strict'
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
const redis = require('redis');
mongoose.connect('mongodb://adminelpatron:Wd4CeFIIrRyM8vUJ7D2YXTKj@mongo:27017/elpatron?authSource=admin',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  },
  err => {
    if (!err) {
      console.log("MongoDB conexão bem sucedida.");
    } else {
      console.log("Error na conexão do MongoDB : " + err);
    }
  }
);
const client = redis.createClient(6379, "redis");
client.on('connect', (err) => {
  if (!err) {

    console.log('Redis conexão bem sucedida!');
  } else {
    e.log('Error na conexão com o Redis: ' + err);
  }

});
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(require('./routes.js'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
