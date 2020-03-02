var express = require('express');
var session = require('express-session')
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var models = require('./models/models')
var routes = require('./routes/index');
var auth = require('./routes/auth');
var MongoStore = require('connect-mongo/es5')(session);
var mongoose = require('mongoose');
var app = express();
var User = require('./models/models').User;

mongoose.connection.on('connected', function() {
  console.log('Connected to MongoDb!');
})
mongoose.connection.on('error', function(err) {
  console.log('Error connecting to MongoDb: ' + err);
  process.exit(1);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secretCat'));
app.use(express.static(path.join(__dirname, 'public')));

// var connect = process.env.MONGODB_URI || require('./models/connect');
// mongoose.connect(connectVar);

// Passport stuff here

app.use(session({
 secret: "ingrid",
 name: 'Catscoookie',
 store: new MongoStore({ mongooseConnection: mongoose.connection }),
 proxy: true,
 resave: true,
 saveUninitialized: true
}));

// Session info here

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// Passport Serialize
passport.serializeUser(function(user, done) {
 done(null, user._id);
});
// Passport Deserialize
passport.deserializeUser(function(id, done) {
    models.User.findById(id, function(err, user) {
        done(err, user);
    })
});

// Passport Strategy
passport.use(new LocalStrategy(function(username, password, done){
 //find the user with the given username
 console.log('USERNAME', username);
 models.User.find(function(err, users) {
   if (err) {
     return done(err);
   } else {
     console.log(users);
     return users;
   }
 });
 models.User.findOne({email: username}, function(err, user) {
   //if error, finish trying to authenticate
   if (err) {
     console.error(err);
     return done(err);
   }
   //if no user present auth failed
   if (!user) {
     console.log(user);
     return done(null, false, { message: 'Incorrect username.' });
   }
   // auth has succeeded
   return done(null, user);
 });
}
));
app.use('/', auth(passport));
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
 var err = new Error('Not Found');
 err.status = 404;
 next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
 app.use(function(err, req, res, next) {
   res.status(err.status || 500);
   res.render('error', {
     message: err.message,
     error: err
   });
 });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
   message: err.message,
   error: {}
 });
});



// try inserting www at bottom of app.js

/**
 * Module dependencies.
 */

var debug = require('debug')('doublemessage:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

// var port = normalizePort(process.env.PORT || '3000');
var port = normalizePort('3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
// try inserting www at bottom of app.js


module.exports = app;
