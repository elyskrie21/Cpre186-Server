const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cron = require('node-cron'); 
const Update = require('./scripts/update'); 

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config/database'); 
const cors = require('cors'); 

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(passport.initialize()); 

// *creating connection to MongoDB server
mongoose.connect(config.database)
  .then(() => {
    console.log('connected')
  })
  .catch((err) => {
    console.error(err);
  })

// *connect api routes
const api = require('./routes/api');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', api); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Cron scheduled tasks
cron.schedule("0 0,6,12,18 * * *", function() {
  Update(); 
})

module.exports = app;
