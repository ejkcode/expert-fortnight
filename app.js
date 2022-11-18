const express = require('express');
const app = express();

const {getCategories, getReviews, getReviewById, getCommentByReviewId, postCommentByReviewId, patchReviewById, getUsers, deleteCommentById} = require('./controllers/controller.js')

app.use(express.json());

// endpoints
app.get('/api/categories', getCategories);

app.get('/api/reviews', getReviews);

app.get('/api/reviews/:review_id', getReviewById);

app.get('/api/reviews/:review_id/comments', getCommentByReviewId);

app.post('/api/reviews/:review_id/comments', postCommentByReviewId);

app.patch('/api/reviews/:review_id', patchReviewById);

app.get('/api/users', getUsers);

app.delete('/api/comments/:comment_id', deleteCommentById);

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