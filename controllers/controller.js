const {fetchCategories, fetchReviews, fetchReviewById, fetchCommentByReviewId} = require('../models/models.js')

const getCategories = (req, res) => {
    fetchCategories()
        .then((categories) => {
            res.status(200).send({categories});
        });
};

const getReviews = (req, res, next) => {
    fetchReviews()
        .then((reviews) => {
            res.status(200).send({reviews});
        });
};

const getReviewById = (req, res, next) => {
    const {review_id} = req.params;
    fetchReviewById(review_id)
        .then((review) => {
            res.status(200).send({review});
        })
        .catch((err) => {
            next(err);
        })
};

const getCommentByReviewId = (req, res, next) => {
    const {review_id} = req.params;
    fetchCommentByReviewId(review_id)
        .then((comments) => {
            res.status(200).send({comments});
        })
        .catch((err) => {
            next(err);
        });
};

module.exports = {getCategories, getReviews, getReviewById, getCommentByReviewId};

