var express = require('express');
var router = express.Router();
var dateformat = require('dateformat');

/* GET manage login page. */
router.get('/', function (req, res) {
    res.render('m', {
        "data": require('../database/data.json'),
        "dateformat": require('dateformat')
    });
});

module.exports = router;
