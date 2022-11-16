const express = require('express');
const app = express();

const {getCategories, getReviews, getReviewById, getCommentByReviewId} = require('./controllers/controller.js')

// endpoints
app.get('/api/categories', getCategories);

app.get('/api/reviews', getReviews);

app.get('/api/reviews/:review_id', getReviewById);

app.get('/api/reviews/:review_id/comments', getCommentByReviewId);

// error-handling

app.use((err, req, res, next) => {
    if (err.code === '22P02'){
        res.status(400).send({msg: 'invalid user input'})
    } else {
        next(err);
    };
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg});
    } else {
        next(err);
    };
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg: 'server error'});
})

module.exports = app;