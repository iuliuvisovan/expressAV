var express = require('express');
var router = express.Router();

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY });

var fs = require('fs-extra');
var mongoose = require('mongoose');
var { MediaVideo, MediaPhoto, RepertoireItem, Concert, AboutSection } = require('../models');

/* GET manage edit page. */
router.get('/', function (request, response) {
  if (request.cookies.loggedIn || request.cookies.loggedInDemo) response.render('manage');
  else response.redirect('/');
});

router.post('*', (request, response, next) => {
  if (request.cookies.loggedInDemo) response.status(200).send('Your operation was completed! Woo! (jk)');
  else if (request.cookies.loggedIn) next();
  else response.status(403).redirect('/');
});

//About
router.get('/about', (request, response) => {
  sendModel('aboutSection', response);
});

router.post('/about', (request, response) => {
  var section = new AboutSection({
    title: request.body.title,
    content: request.body.content,
  });
  if (request.body._id) section._id = request.body._id;
  // if (request.cookies.loggedInDemo)
  //     response.render('manage');
  addOrUpdateModel(section, 'aboutSection', response);
});

//Concerts
router.get('/concerts', (request, response) => {
  sendModel('concert', response);
});

router.post('/concerts/save', (request, response) => {
  var concert = new Concert({
    name: request.body.name,
    date: request.body.date,
    city: request.body.city,
    location: request.body.location,
    programme: request.body.programme,
  });
  if (request.body._id) concert._id = request.body._id;
  console.log('Request to save concert: ' + concert);
  addOrUpdateModel(concert, 'concert', response);
});

router.post('/concerts/remove', (request, response) => {
  removeById('concert', request.body._id, response);
});

//Media
router.get('/mediaPhotos', (request, response) => {
  sendModel('mediaPhoto', response);
});

const uploadImageToS3 = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    fileFilter: function (_req, file, cb) {
      // Allowed ext
      const filetypes = /jpeg|jpg|png|gif/;
      // Check ext
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      // Check mime
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb('Error: Images Only!');
      }
    },
    key: (req, file, cb) => {
      console.log('file', file);

      const imageKey = `media-photos/${+new Date()}-${file.originalname}`;

      req.imageKey = imageKey;

      cb(null, imageKey);
    },
  }),
}).single('image');

const createDbEntry = async (req, res, next) => {
  try {
    const { location: imageUrl } = req.file;

    addOrUpdateModel(
      new MediaPhoto({
        url: imageUrl,
        active: true,
        alt: 'Aurelia Vișovan Carousel Image',
        title: 'Aurelia Vișovan',
        key: req.imageKey,
      }),
      'mediaPhoto'
    );
    return res.status(200).send(imageUrl);
  } catch (err) {
    next(err);
  }
};

router.post('/mediaPhotos/upload', uploadImageToS3, createDbEntry);

router.get('/mediaVideos', function (request, response) {
  sendModel('mediaVideo', response);
});

router.post('/mediaVideos/remove', function (request, response) {
  removeById('mediaVideo', request.body._id, response);
});

router.post('/mediaPhotos/remove', async (request, response) => {
  const { _id } = request.body;

  const image = await MediaPhoto.findById(_id);

  console.log('image', image);

  await new AWS.S3().deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: image.key }, (err, data) => {
    if (err) {
      if (response) {
        return response.status(500).send(err);
      }
    } else {
      removeById('mediaPhoto', _id, response);
    }
  });
});

router.post('/mediaVideos/save', function (request, response) {
  addOrUpdateModel(
    new MediaVideo({
      imageUrl: request.body.imageUrl,
      ratio: request.body.ratio,
      title: request.body.title,
      url: request.body.url,
      year: request.body.year,
    }),
    'mediaVideo',
    response
  );
});

router.post('/mediaVideos/upload', function (request, response) {
  var base64Data = request.body.image.replace(/^data:image\/png;base64,/, '');

  var newFileLocation = './public/img/media/';
  var newImageName = 'video-thumbnail' + +new Date() + '.jpg';
  var newImageFullName = newFileLocation + newImageName;

  fs.writeFile(newImageFullName, base64Data, 'base64', function (err) {
    if (err) console.log(err);
    else {
      console.log('******** Video thumbnail created from base64 encoded string and saved as: ' + newImageFullName);
      response.status(200).send('/img/media/' + newImageName);
    }
  });
});

router.post('/mediaVideos/removeVideoImage', function (request, response) {
  if (request.body.url) fs.unlinkSync('public/' + request.body.url);
});

//Repertoire
router.get('/repertoire', function (request, response) {
  sendModel('repertoireItem', response);
});

router.post('/repertoire/add', function (request, response) {
  var repertoireItem = new RepertoireItem({
    type: request.body.type,
    composer: request.body.composer,
    compositions: request.body.compositions,
  });
  if (request.body._id) repertoireItem._id = request.body._id;
  addOrUpdateModel(repertoireItem, 'repertoireItem', response);
});

router.post('/repertoire/removeComposer', function (request, response) {
  removeById('repertoireItem', request.body._id, response);
});

async function sendModel(modelName, response) {
  try {
    const docs = await mongoose.model(modelName).find({});
    if (modelName == 'repertoireItem') {
      var sortedDocs = docs.sort(function (a, b) {
        var textA = a.composer.toUpperCase().split(' ').splice(-1);
        var textB = b.composer.toUpperCase().split(' ').splice(-1);
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      response.send(sortedDocs);
    } else response.send(docs);
  } catch (err) {
    response.status(500).send(err);
  }
}

async function addOrUpdateModel(model, modelName, response) {
  console.log('Attempting to save object: \n ' + model);
  var query = {
    _id: model._id,
  };
  try {
    await mongoose.model(modelName).findOneAndUpdate(query, model, { upsert: true });
    console.log('Successfullly added / updated model to database.');
    if (response) response.status(200).send(model._id);
  } catch (error) {
    console.log('Error occured when trying to add / update! ' + error);
    if (response) response.status(500).send(error);
  }
}

async function removeById(modelName, id, response) {
  console.log('Attempting to remove ' + modelName + ' with ID ' + id);
  try {
    await mongoose.model(modelName).findByIdAndDelete(id);
    console.log('Success removing item from database.');
    response.status(200).send('Successfully removed model from database: id: ' + id);
  } catch (error) {
    console.log('Error removing item from database: ' + error);
    response.status(500).send(error);
  }
}

module.exports = router;
