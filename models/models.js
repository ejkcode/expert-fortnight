const db = require('../db/connections.js');
const {checkReviewIdExists, checkUserExistsInUsers} = require('../db/seeds/utils.js');

const fetchCategories = () => {
    return db.query(`SELECT * FROM categories`)
        .then((result) => {
            return result.rows;
        });
};

const fetchReviews = (category, sort_by='created_at', order='DESC') => {
    let queryString = `SELECT reviews.review_id,reviews.owner, reviews.title, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id`
    const queryValues = [];

    const validCategories = ['euro game', 'social deduction', 'dexterity', "children's games"];
    const validColumns = ['title', 'designer', 'owner', 'review_img_url', 'review_body', 'category', 'created_at', 'votes'];
    const validOrders = ['ASC', 'DESC'];
    if (category){
        if (!validCategories.includes(category)){
            return Promise.reject({status: 400, msg: 'category not found'});
        };
        queryString += ` WHERE category = $1`;
        queryValues.push(category);
    };
    if (!validColumns.includes(sort_by) || !validOrders.includes(order)){
        return Promise.reject({status: 400, msg: 'invalid sort query'});
    };
    queryString += ` GROUP BY reviews.review_id ORDER BY ${sort_by} ${order}`;
    return db.query(queryString, queryValues)
    .then((result) => {
        return result.rows;
    });
};

const fetchReviewById = (review_id) => {
    return db.query(`
        SELECT reviews.*, COUNT(comments.review_id) AS comment_count
        FROM reviews
        LEFT JOIN comments ON comments.review_id = reviews.review_id
        WHERE reviews.review_id = $1
        GROUP BY reviews.review_id
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

const updateReviewById = (review_id, inc_votes) => {
    return checkReviewIdExists(review_id)
    .then(() => {
        return db.query(`
            UPDATE reviews
            SET votes = votes + $1
            WHERE review_id = $2
            RETURNING *;
        `, [inc_votes, review_id])
        .then((result) => {
            if (result.rows[0].votes <= 0) {
                return db.query(`
                    UPDATE reviews
                    SET votes = 0
                    WHERE review_id = $1
                    RETURNING *;
                `, [result.rows[0].review_id])
                .then((result) => {
                    return result.rows[0];
                })
            }
            return result.rows[0];
        });
    })
};

const fetchUsers = () => {
    return db.query(`SELECT * FROM users`)
        .then((result) => {
            return result.rows;
        });
};

module.exports = {fetchCategories, fetchReviews, fetchReviewById, fetchCommentByReviewId, addCommentByReviewId, updateReviewById, fetchUsers};

