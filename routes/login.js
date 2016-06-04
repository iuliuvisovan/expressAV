var express = require('express');
var router = express.Router();
var dateformat = require('dateformat');
var data = require('../database/data.json');
/* POST login info. */

router.post('/', function (request, response) {
    if (request.body.password == data.password) {
        response.cookie('loggedIn', 1, { maxAge: 100 * 60 * 1000 });
        response.redirect('./manage');
    }
    else if(request.body.password == data.password_demo)
    {
        response.cookie('loggedInDemo', 1, { maxAge: 100 * 60 * 1000 });
        response.redirect('./manage');
    }
    else
    {
        response.status(403);
        response.end();
    }
});

module.exports = router;
