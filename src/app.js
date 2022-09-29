/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// Initial setup
const express = require("express");
const app = express();
const path = require("path");
const router = require('./routes/router');
const morgan = require('morgan'); // Logs incoming HTTP requests
const cors = require('cors'); // Enables CORS


// Database integration
const mongoose = require('mongoose');
// Connects to database
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@cluster0.mp2sisu.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`)
    .then( () => {
      console.log('Connected to database ');
    })
    .catch( (err) => {
      console.error(`Error connecting to the database. \n${err}`);
    });
    
app.use(morgan('dev')); // Sets logging mode
app.use(cors()); // Enables CORS
app.use(express.json());
app.use(express.urlencoded());

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(BUILD_DIR, "index.html"));
// });

app.use('/', router);
module.exports = app;
