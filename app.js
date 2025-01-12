require("dotenv").config()
require("./models/connection")

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var blocsRouter = require('./routes/blocs');
var devRouter = require('./routes/dev');
var indexRouter = require('./routes/index');
var notesRouter = require('./routes/notes');
var tagsRouter = require('./routes/tags');
var usersRouter = require('./routes/users');

var app = express();
const cors = require('cors');

app.use(cors());  
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/blocs', blocsRouter);
app.use('/dev', devRouter);
app.use('/notes', notesRouter);
app.use('/tags', tagsRouter);
app.use('/users', usersRouter);

module.exports = app;
