var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { sequelize } = require("./models");
require('dotenv').config();
var indexRouter = require('./routes/index');

var app = express();


async function test() {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.log("Database connection failure.");
    console.log(e);
    return;
  }

  console.log("Database connection success!");
  console.log("Sequelize is ready to use!");

  // Close database connection when done with it.
  await sequelize.close();
}

test();

// const whiteList = ['http://localhost:3000/*', 'https://psstats.herokuapp.com/*'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('not allowed by CORS'));
//     }
//   }
// }

// const cors = require('cors');

// app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(cors());
app.use('/', indexRouter);

module.exports = app;
