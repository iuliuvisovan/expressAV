var express = require('express');
var router = express.Router();
var dateformat = require('dateformat');
var mongoose = require('mongoose');
var models = require('../models/index.js');

/* GET home page. */
router.get('/', function (request, response) {
  var data = {
    aboutSections: [],
    concerts: [],
    mediaPhotos: [],
    mediaVideos: [],
    repertoireItems: [],
  };
  mongoose.model('aboutSection').find({}, function (err, docs) {
    data.aboutSections = docs;
  });
  mongoose.model('concert').find({}, function (err, docs) {
    data.concerts = docs.map((x) => {
      x.flag = getCountryByCity(x.city);
      return x;
    });
  });
  mongoose.model('mediaPhoto').find({}, function (err, docs) {
    data.mediaPhotos = docs;
  });
  mongoose.model('mediaVideo').find({}, function (err, docs) {
    data.mediaVideos = docs;
  });
  mongoose.model('repertoireItem').find({}, function (err, docs) {
    var sortedDocs = docs.sort(function (a, b) {
      var textA = a.composer.toUpperCase().split(' ').splice(-1);
      var textB = b.composer.toUpperCase().split(' ').splice(-1);
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
    data.repertoireItems = sortedDocs;
    setTimeout(function () {
      response.render('index', {
        data: data,
        dateformat: require('dateformat'),
      });
    }, 1500);
  });
});

var getCountryByCity = (city) => {
  if (!city) return;
  if (
    city.indexOf('US') > -1 ||
    city.toLowerCase().indexOf('u.s') > -1 ||
    city.toLowerCase().indexOf('u.s.') > -1 ||
    city.toLowerCase().indexOf('united') > -1
  )
    return 'us';
  city = city.toLowerCase();
  if (city.indexOf('aust') > -1) return 'at';
  if (city.indexOf('port') > -1) return 'pt';
  if (city.indexOf('rom') > -1) return 'ro';
  if (city.indexOf('germ') > -1) return 'de';
  if (city.indexOf('fran') > -1) return 'fr';
  if (city.indexOf('jap') > -1) return 'jp';
  if (city.indexOf('belg') > -1) return 'be';
  if (city.indexOf('ital') > -1) return 'it';
  if (city.indexOf('turk') > -1) return 'tr';
  if (city.indexOf('nether') > -1) return 'nl';
  if (city.indexOf('holl') > -1) return 'nl';
  if (city.indexOf('gree') > -1) return 'gr';
  if (city.indexOf('spa') > -1) return 'es';
  if (city.indexOf('slova') > -1) return 'sk';
  if (city.indexOf('switz') > -1) return 'ch';
  if (city.indexOf('malt') > -1) return 'mt';
  if (city.indexOf('south ko') > -1) return 'kr';
  if (city.indexOf('hungar') > -1) return 'hu';
  if (city.indexOf('poland') > -1) return 'pl';

  if (city.indexOf('canada') > -1) return 'ca';
  if (city.indexOf('swed') > -1) return 'se';
  if (city.indexOf('norw') > -1) return 'no';
  if (city.indexOf('denm') > -1) return 'dk';
  if (city.indexOf('finla') > -1) return 'fi';
  if (city.indexOf('russ') > -1) return 'ru';
  if (city.indexOf('ukra') > -1) return 'ua';
  if (city.indexOf('bulg') > -1) return 'bg';
  if (city.indexOf('croa') > -1) return 'hr';
  if (city.indexOf('czech') > -1) return 'cz';
  if (city.indexOf('serb') > -1) return 'rs';
  if (city.indexOf('esto') > -1) return 'ee';
  if (city.indexOf('latv') > -1) return 'lv';
  if (city.indexOf('lith') > -1) return 'lt';
  if (city.indexOf('irela') > -1) return 'ie';
  if (city.indexOf('chin') > -1) return 'cn';
  if (city.indexOf('braz') > -1) return 'br';
};

module.exports = router;
