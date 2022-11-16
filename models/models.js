const db = require('../db/connections.js');
const {checkReviewIdExists, checkUserExistsInUsers} = require('../db/seeds/utils.js');

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

const fetchCommentByReviewId = (review_id) => {
    return checkReviewIdExists(review_id)
        .then(() => {
            return db.query(`
                SELECT * FROM comments
                WHERE review_id = $1
                ORDER BY created_at DESC;
            `, [review_id])
            .then((result) => {
                return result.rows;
            });
        });
};

const addCommentByReviewId = (review_id, newComment) => {
    if (!newComment.username || !newComment.body) {
        return Promise.reject({
            status: 400,
            msg: 'missing username and/or body properties in request body'
        });
    };
    return checkReviewIdExists(review_id)
    .then(() => {
        return checkUserExistsInUsers(newComment.username)
        .then(() => {
            return db.query(`
            INSERT INTO comments
            (author, body, review_id)
            VALUES
            ($1, $2, $3)
            RETURNING *;
            `, [newComment.username, newComment.body, review_id])
            .then((result) => {
                return result.rows[0];
            });
            
        });
    });
};

module.exports = {fetchCategories, fetchReviews, fetchReviewById, fetchCommentByReviewId, addCommentByReviewId};

