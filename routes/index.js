var express = require('express');
var router = express.Router();
var dateformat = require('dateformat');
var mongoose = require('mongoose');
var models = require('../models/models.js');

/* GET home page. */
router.get('/', function (request, response) {
    var data = {
        aboutSections: [],
        concerts: [],
        mediaPhotos: [],
        mediaVideos: [],
        repertoireItems: []
    }
    mongoose.model('aboutSection').find({}, function (err, docs) {
        data.aboutSections = docs;
    });
    mongoose.model('concert').find({}, function (err, docs) {
        data.concerts = docs;
    });
    mongoose.model('mediaPhoto').find({}, function (err, docs) {
        data.mediaPhotos = docs;
    });
    mongoose.model('mediaVideo').find({}, function (err, docs) {
        data.mediaVideos = docs;
    });
    mongoose.model('repertoireItem').find({}, function (err, docs) {
        var sortedDocs = docs.sort(function(a, b) {
            var textA = a.composer.toUpperCase().split(" ").splice(-1);
            var textB = b.composer.toUpperCase().split(" ").splice(-1);
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        data.repertoireItems = sortedDocs;
        setTimeout(function () {
            response.render('index', {
                "data": data,
                "dateformat": require('dateformat')
            });
        }, 1500);
    });
});


module.exports = router;
