var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var flash = require('connect-flash');

var routes = require('./routes/index');
var posts = require('./routes/posts');

var app = express();


app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var multer = require('multer');
var upload = multer({ dest: './uploads' });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Express session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

//Express Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

	while(namespace.length) {
		formParam += '[' + namespace.shift() + ']'
	}
	return {
		param : formParam,
		msg : msg,
		value : value
	};
	}
}));


app.use(express.static(path.join(__dirname, 'public')));

//Connect Flash
app.use(flash());
app.use(function (req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//Make db accessible to our router
app.use(function(req, res, next){
	req.db = db;
	next();
});

app.use('/', routes);
app.use('/posts', posts);

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

module.exports = app;
