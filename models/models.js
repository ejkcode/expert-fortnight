const db = require('../db/connections.js');

const fetchCategories = () => {
    return db.query(`SELECT * FROM categories`)
        .then((result) => {
            return result.rows;
        });
};

const fetchReviews = () => {
    return db.query(`
    SELECT reviews.review_id,reviews.owner, reviews.title, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.created_at DESC;
    `)
    .then((result) => {
        return result.rows;
    });
};

const fetchReviewById = (review_id) => {
    return db.query(`
        SELECT * FROM reviews
        WHERE review_id = $1;
    `, [review_id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'review_id not found'
            });
        };
        return result.rows[0];
    })
};

module.exports = {fetchCategories, fetchReviews, fetchReviewById};

