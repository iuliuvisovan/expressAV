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
        data.concerts = docs.map(x => { x.flag = getCountryByCity(x.city); return x; });;
    });
    mongoose.model('mediaPhoto').find({}, function (err, docs) {
        data.mediaPhotos = docs;
    });
    mongoose.model('mediaVideo').find({}, function (err, docs) {
        data.mediaVideos = docs;
    });
    mongoose.model('repertoireItem').find({}, function (err, docs) {
        var sortedDocs = docs.sort(function (a, b) {
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

var getCountryByCity = (city) => {
    if (!city)
        return;
    city = city.toLowerCase();
    if (city.indexOf('aust') > -1)
        return 'at';
    if (city.indexOf('port') > -1)
        return 'pt';
    if (city.indexOf('rom') > -1)
        return 'ro';
    if (city.indexOf('germ') > -1)
        return 'de';
    if (city.indexOf('fran') > -1)
        return 'fr';
    if (city.indexOf('jap') > -1)
        return 'jp';
    if (city.indexOf('belg') > -1)
        return 'be';
    if (city.indexOf('ital') > -1)
        return 'it';
    if (city.indexOf('turk') > -1)
        return 'tr';
}

module.exports = router;