
const {fetchCategories, fetchReviews} = require('../models/models.js')


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

module.exports = {getCategories, getReviews};

