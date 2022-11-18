const {fetchCategories, fetchReviews, fetchReviewById, fetchCommentByReviewId, addCommentByReviewId, updateReviewById, fetchUsers} = require('../models/models.js')

const getCategories = (req, res) => {
    fetchCategories()
        .then((categories) => {
            res.status(200).send({categories});
        });
};

const getReviews = (req, res, next) => {
    const {category, sort_by, order} = req.query;
    fetchReviews(category,sort_by, order)
        .then((reviews) => {
            res.status(200).send({reviews});
        })
        .catch((err) => {
            next(err);
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

const postCommentByReviewId = (req, res, next) => {
    const {review_id} = req.params;
    const newComment = req.body;
    addCommentByReviewId(review_id, newComment)
        .then((comment) => {
            res.status(201).send({comment});
        })
        .catch((err) => {
            next(err);
        });
};

const patchReviewById = (req, res, next) => {
    const {review_id} = req.params;
    const {inc_votes} = req.body;
    updateReviewById(review_id, inc_votes)
        .then((updated_review) => {
            res.status(200).send({updated_review});
        })
        .catch((err) => {
            next(err);
        });
};

const getUsers = (req, res, next) => {
    fetchUsers().then((users) => {
        res.status(200).send({users});
    });
}

module.exports = {getCategories, getReviews, getReviewById, getCommentByReviewId, postCommentByReviewId, patchReviewById, getUsers};

