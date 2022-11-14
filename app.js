const express = require('express');
const app = express();
const {getCategories} = require('./controllers/controller.js')

// endpoints
app.get('/api/categories', getCategories);


// error-handling
// app.use((err, req, res, next) => {
//
// })

module.exports = app;