const {fetchCategories, fetchReviews, fetchReviewById} = require('../models/models.js')

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

module.exports = {getCategories, getReviews, getReviewById};

