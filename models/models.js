const db = require('../db/connections.js');

const fetchCategories = () => {
    return db.query(`SELECT * FROM categories`)
        .then((result) => {
            return result.rows;
        })
}

module.exports = {fetchCategories};