var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.aboutSection = mongoose.model('aboutSection', new mongoose.Schema({
    title: String,
    content: String
}));

exports.concert = mongoose.model('concert', new mongoose.Schema({
    name: String,
    date: Number,
    city: String,
    location: String,
    programme: String
}));

exports.mediaPhoto = mongoose.model('mediaPhoto', new mongoose.Schema({
    url: String,
    active: Boolean,
    alt: String,
    title: String
}));

exports.mediaVideo = mongoose.model('mediaVideo', new mongoose.Schema({
    title: String,
    url: String,
    ratio: String,
    year: String,
    imageUrl: String
}));

exports.repertoireItem = mongoose.model('repertoireItem', new mongoose.Schema({
    type: Number, // 1-Piano concertos / 2-Chamber Music / 3-Solo piano
    composer: String,
    compositions: [{type: String}]
}));
