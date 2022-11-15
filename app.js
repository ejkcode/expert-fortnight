const express = require('express');
const app = express();

const {getCategories, getReviews} = require('./controllers/controller.js')


// endpoints
app.get('/api/categories', getCategories);


app.get('/api/reviews', getReviews);

// error-handling
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg: 'server error'});
})




module.exports = app;