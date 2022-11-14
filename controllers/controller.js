const {fetchCategories} = require('../models/models.js')

const getCategories = (req, res) => {
    fetchCategories()
        .then((categories) => {
            res.status(200).send({categories})
        })
}

module.exports = {getCategories}