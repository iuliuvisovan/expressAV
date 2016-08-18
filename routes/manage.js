var express = require('express');
var router = express.Router();
var dateformat = require('dateformat');
var fs = require('fs-extra');
var mongoose = require('mongoose');
var models = require('../models/models.js');

/* GET manage edit page. */
router.get('/', function (request, response) {
    // backupDatabase();
    // applyBackup();
    if (request.cookies.loggedIn || request.cookies.loggedInDemo)
        response.render('manage');
    else
        response.redirect('/');
});

router.post('*', function (request, response, next) {
    if (request.cookies.loggedInDemo)
        response.status(200).send("Your operation was completed! Woo! (jk)");
    else if (request.cookies.loggedIn)
        next();
    else
        response.status(403).redirect('/');
});

//About
router.get('/about', function (request, response) {
    sendModel('aboutSection', response);
});

router.post('/about', function (request, response) {
    var section = new models.aboutSection({
        title: request.body.title,
        content: request.body.content
    });
    if (request.body._id)
        section._id = request.body._id;
    // if (request.cookies.loggedInDemo)
    //     response.render('manage');
    addOrUpdateModel(section, 'aboutSection', response);
});

//Concerts
router.get('/concerts', function (request, response) {
    sendModel('concert', response);
});

router.post('/concerts/save', function (request, response) {
    var concert = new models.concert({
        name: request.body.name,
        date: request.body.date,
        city: request.body.city,
        location: request.body.location,
        programme: request.body.programme
    });
    if (request.body._id)
        concert._id = request.body._id;
    console.log("Request to save concert: " + concert);
    addOrUpdateModel(concert, 'concert', response);
});

router.post('/concerts/remove', function (request, response) {
    removeById('concert', request.body._id, response);
});

//Media
router.get('/mediaPhotos', function (request, response) {
    sendModel('mediaPhoto', response);
});

router.post('/mediaPhotos/upload', function (request, response) {
    var formidable = require('formidable'),
        form = new formidable.IncomingForm();
    form.parse(request);

    form.on('end', function (fields, files) {
        var tempPath = this.openedFiles[0].path;
        var newFileLocation = "./public/img/carousel/";
        var newImageName = "aurelia-piano" + (fs.readdirSync("./public/img/carousel").length + 1) + ".jpg";
        var newImageFullName = newFileLocation + newImageName;
        fs.copy(tempPath, newImageFullName, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Successfully uploaded new image: " + newImageFullName);
                addOrUpdateModel(new models.mediaPhoto({
                    url: "/img/carousel/" + newImageName,
                    active: true,
                    alt: "Aurelia Visovan Carousel Image",
                    title: "Aurelia Visovan"
                }), 'mediaPhoto');
                response.status(200).send("/img/carousel/" + newImageName);
            }
        });
    });
});

router.get('/mediaVideos', function (request, response) {
    sendModel('mediaVideo', response);
});

router.post('/mediaVideos/remove', function (request, response) {
    if (request.body.imageUrl)
        fs.unlinkSync("public/" + request.body.imageUrl);
    removeById('mediaVideo', request.body._id, response);
});

router.post('/mediaPhotos/remove', function (request, response) {
    if (request.body.url)
        fs.unlink("public/" + request.body.url, function (error) {
        });
    removeById('mediaPhoto', request.body._id, response);

});

router.post('/mediaVideos/save', function (request, response) {
    addOrUpdateModel(new models.mediaVideo({
        imageUrl: request.body.imageUrl,
        ratio: request.body.ratio,
        title: request.body.title,
        url: request.body.url,
        year: request.body.year
    }), 'mediaVideo', response);
});

router.post('/mediaVideos/upload', function (request, response) {
    var base64Data = request.body.image.replace(/^data:image\/png;base64,/, "");

    var newFileLocation = "./public/img/media/";
    var newImageName = "video-thumbnail" + (fs.readdirSync("./public/img/media").length + 1) + ".jpg";
    var newImageFullName = newFileLocation + newImageName;

    fs.writeFile(newImageFullName, base64Data, 'base64', function (err) {
        if (err)
            console.log(err);
        else {
            console.log('******** Video image created from base64 encoded string and saved as: ' + newImageFullName);
            response.status(200).send("/img/media/" + newImageName);
        }
    });
});

router.post('/mediaVideos/removeVideoImage', function (request, response) {
    if (request.body.url)
        fs.unlinkSync("public/" + request.body.url);
});

//Repertoire
router.get('/repertoire', function (request, response) {
    sendModel('repertoireItem', response);
});

router.post('/repertoire/add', function (request, response) {
    var repertoireItem = new models.repertoireItem({
        type: request.body.type,
        composer: request.body.composer,
        compositions: request.body.compositions
    });
    if (request.body._id)
        repertoireItem._id = request.body._id;
    addOrUpdateModel(repertoireItem, 'repertoireItem', response);
});

router.post('/repertoire/removeComposer', function (request, response) {
    removeById('repertoireItem', request.body._id, response);
});


function sendModel(modelName, response) {
    mongoose.model(modelName).find({}, function (err, docs) {
        if (!err) {
            if (modelName == 'repertoireItem') {
                var sortedDocs = docs.sort(function (a, b) {
                    var textA = a.composer.toUpperCase().split(" ").splice(-1);
                    var textB = b.composer.toUpperCase().split(" ").splice(-1);
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                response.send(sortedDocs);
            }
            else
                response.send(docs);
        }
        else
            response.status(500).send(err);
    });
}

function addOrUpdateModel(model, modelName, response) {
    console.log("Attempting to save object: \n " + model);
    var query = {'_id': model._id};
    mongoose.model(modelName).findOneAndUpdate(query, model, {upsert: true}, function (error, doc) {
        if (error) {
            console.log("Error occured when trying to add / update! " + error);
            if (response)
                response.status(500).send(error);
        }
        else {
            console.log("Successfullly added / updated model to database.");
            if (response)
                response.status(200).send(model._id);
        }
    });
}

function removeById(modelName, id, response) {
    console.log("Attempting to remove " + modelName + " with ID " + id);
    mongoose.model(modelName).find({_id: id}).remove(function (error) {
        if (error) {
            console.log("Error removing item from database: " + error);
            response.status(500).send(error);
        }

        else {
            console.log("Success removing item from database.");
            response.status(200).send("Successfully removed model from database: id: " + id);
        }
    });
}

function backupDatabase() {
    console.log("Initiating database backup...");
    var currentDate = new Date().getDate();
    // if (currentDate % 3 != 0)
    //     return console.log("Today is not a backup day!");
    var models = mongoose.modelNames();
    var jsonObj = {};
    var propertiesAdded = 0;
    models.forEach(function (item) {
        mongoose.model(item).find({}, function (err, docs) {
            if (err)
                console.log(err);
            else {
                propertiesAdded++;
                jsonObj[item] = docs;
                if (propertiesAdded == models.length)
                    writeToBackupFile(jsonObj);
            }
        });
    });
}

function writeToBackupFile(jsonObj) {
    var currentDate = new Date();
    var filename = "dbbackup_" + currentDate.getDate() + "_" + (currentDate.getMonth() + 1) + "_" + currentDate.getFullYear() + ".json";
    fs.writeFile("./database/" + filename, JSON.stringify(jsonObj, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Database backup completed succesfully!");
    });
}

function applyBackup() {
    var db = require('../database/dbbackup_14_5_116');
    db.aboutSection.forEach(function(item) {
        addOrUpdateModel(item, 'aboutSection');
    });
    db.concert.forEach(function(item) {
        addOrUpdateModel(item, 'concert');
    });
    db.mediaPhoto.forEach(function(item) {
        addOrUpdateModel(item, 'mediaPhoto');
    });
    db.mediaVideo.forEach(function (item) {
        addOrUpdateModel(item, 'mediaVideo');
    });
    // db. .forEach(function (item) {
    //     addOrUpdateModel(item, 'mediaVideo');
    // });
}

function once() {
    var db = require('../database/data_original.json');
    db.repertoire.pianoConcertos.forEach(function(item) {
        var repertoireItem = new models.repertoireItem({
            type: 1,
            composer: item.composer,
            compositions: item.compositions
        });
        addOrUpdateModel(repertoireItem, 'repertoireItem');
    });
    db.repertoire.chamberMusic.forEach(function(item) {
        var repertoireItem = new models.repertoireItem({
            type: 2,
            composer: item.composer,
            compositions: item.compositions
        });
        addOrUpdateModel(repertoireItem, 'repertoireItem');
    });
    db.repertoire.soloPiano.forEach(function(item) {
        var repertoireItem = new models.repertoireItem({
            type: 3,
            composer: item.composer,
            compositions: item.compositions
        });
        addOrUpdateModel(repertoireItem, 'repertoireItem');
    });
}

module.exports = router;