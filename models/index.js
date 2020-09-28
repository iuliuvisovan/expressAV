var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.AboutSection = mongoose.model(
  'aboutSection',
  new Schema({
    title: String,
    content: String,
  })
);

exports.Concert = mongoose.model(
  'concert',
  new Schema({
    name: String,
    date: Number,
    city: String,
    location: String,
    programme: String,
  })
);

exports.MediaPhoto = mongoose.model(
  'mediaPhoto',
  new Schema({
    url: String,
    key: String,
    active: Boolean,
    alt: String,
    title: String,
  })
);

exports.MediaVideo = mongoose.model(
  'mediaVideo',
  new Schema({
    title: String,
    url: String,
    ratio: String,
    year: String,
    imageUrl: String,
  })
);

exports.RepertoireItem = mongoose.model(
  'repertoireItem',
  new Schema({
    type: Number, // 1-Piano concertos / 2-Chamber Music / 3-Solo piano
    composer: String,
    compositions: [{ type: String }],
  })
);
