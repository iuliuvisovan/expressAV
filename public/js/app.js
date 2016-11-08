var avModule = angular.module('avModule', ['ngRoute', 'ngImgCrop']);

var hasSeenIntro = false;

avModule.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'LandingController',
            templateUrl: 'partials/manage_landing.html'
        })
        .when('/about', {
            controller: 'AboutController',
            templateUrl: 'partials/manage_about.html'
        })
        .when('/concerts', {
            controller: 'ConcertsController',
            templateUrl: 'partials/manage_concerts.html'
        })
        .when('/media', {
            controller: 'MediaController',
            templateUrl: 'partials/manage_media.html'
        })
        .when('/repertoire', {
            controller: 'RepertoireController',
            templateUrl: 'partials/manage_repertoire.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});

avModule
    .factory('aboutService', function ($http) {
        return {
            getParagraphs: function () {
                return $http.get('/manage/about')
                    .then(function (result) {
                        return result.data;
                    });
            }
        }
    })
    .factory('concertService', function ($http) {
        return {
            getConcerts: function () {
                return $http.get('/manage/concerts')
                    .then(function (result) {
                        return result.data;
                    });
            }
        }
    })
    .factory('mediaPhotosService', function ($http) {
        return {
            getMediaPhotos: function () {
                return $http.get('/manage/mediaPhotos')
                    .then(function (result) {
                        return result.data;
                    });
            }
        }
    })
    .factory('mediaVideosService', function ($http) {
        return {
            getMediaVideos: function () {
                return $http.get('/manage/mediaVideos')
                    .then(function (result) {
                        return result.data;
                    });
            }
        }
    })
    .factory('repertoireService', function ($http) {
        return {
            getRepertoireItems: function () {
                return $http.get('/manage/repertoire')
                    .then(function (result) {
                        return result.data;
                    });
            }
        }
    });

avModule
    .controller('LandingController', function ($scope) {
        var init = function () {
            selectMenuItem($('[href="#/"]'));
            showTitle("hi", 500, 3500);
            showTitle("welcomeTo", 4000, 0);
            showTitle("youCanChange", 6500, 0);
            showTitle("goodLuck", 10000, 0);
        };

        var showTitle = function (elementId, startAfter, hideAfter) {
            setTimeout(function () {
                $("#" + elementId).fadeIn()
            }, startAfter);
            if (hideAfter)
                setTimeout(function () {
                    $("#" + elementId).fadeOut()
                }, hideAfter);
        };

        if (!hasSeenIntro) {
            init();
            hasSeenIntro = true;
        } else
            showTitle("youCanStart", 500, 0);

    })
    .controller('AboutController', function ($scope, aboutService, $route) {
        init();

        function init() {
            selectMenuItem($('[href="#/about"]'));
            doFunkyStuffAndThenShowPage(function () {
                $scope.$apply();
                aboutService.getParagraphs().then(function (paragraphs) {
                    $scope.paragraphs = paragraphs;
                    $scope.selectParagraph(2);
                });
            });
        }

        $scope.selectParagraph = function (id) {
            $("#aboutParagraphs").fadeIn();
            $(".btn-circle").removeClass('selected');
            $("#" + id).addClass('selected', 'slow');
            $scope.selectedParagraph = $scope.paragraphs[id - 1];
            $scope.selectedParagraphIndex = id;

            $($("#paragraphTitle")).prop('contenteditable', 'false');
            $($("#paragraphTitle")).css('border', 'none');

            $($("#paragraphContent")).prop('contenteditable', 'false');
            $($("#paragraphContent")).css('border', 'none');

            $("#btnCancel").hide();
            $("#btnEdit").show();
            $("#btnOk").hide();
        };

        $scope.editParagraph = function () {
            $("#paragraphContent").focus();
            $("#btnEdit").hide();
            $("#btnOk").show();
            $("#btnCancel").show();
            toggleContentEditable($("#paragraphTitle"));
            toggleContentEditable($("#paragraphContent"));
        };

        $scope.cancelEdit = function () {
            $route.reload();
        }

        $scope.saveParagraph = function () {
            $scope.selectedParagraph.title = $("#paragraphTitle").text().trim();
            $scope.selectedParagraph.content = $("#paragraphContent").text().trim();
            toggleContentEditable($("#paragraphTitle"));
            toggleContentEditable($("#paragraphContent"));
            $("#btnEdit").show();
            $("#btnOk").hide();
            $("#btnCancel").hide();
            $.ajax({
                url: "/manage/about",
                cache: false,
                type: "POST",
                contentType: "application/json",
                data: angular.toJson($scope.selectedParagraph),
                success: function () {
                    showNotification('Edits saved');
                },
                error: function () {
                    showNotification('Paragraph couldn\'t be saved! :s', true);
                }
            });
        }
    })
    .controller('ConcertsController', function ($scope, concertService, $filter) {
        init();

        function init() {
            selectMenuItem($('[href="#/concerts"]'));
            $scope.editCancelled = true;
            doFunkyStuffAndThenShowPage();
            concertService.getConcerts().then(function (concerts) {
                $scope.upcomingConcerts = concerts.filter(function (item) {
                    return new Date(item.date * 1000) >= new Date();
                });
                $scope.archiveConcerts = concerts.filter(function (item) {
                    return new Date(item.date * 1000) < new Date();
                });
                $scope.newConcert = {
                    "id": 0
                }
                $("#actualConcerts").fadeIn();
            });
        }

        $scope.editConcert = function (targetId) {
            var fields = $("#" + targetId + " .field");
            fields.prop('contenteditable', true);
            fields.css({
                'border': '1px solid rgba(255, 255, 255, 0.4)',
                'padding': '0 5px'
            });
            fields.eq(1).focus();
            $("#editConcert" + targetId).hide();
            $("#saveConcert" + targetId).show();
            $("#cancelConcertEdit" + targetId).show();
        }

        $scope.cancelConcertEdit = function (targetId) {
            var fields = $("#" + targetId + " .field");
            // fields.prop('contenteditable', false);
            fields.css('border', 'none');
            fields.css('padding', 'initial');

            $("#editConcert" + targetId).show();
            $("#saveConcert" + targetId).hide();
            $("#cancelConcertEdit" + targetId).hide();
            $scope.editCancelled = false;
            setTimeout(function () {
                $scope.editCancelled = true;
            });
        };

        $scope.saveConcert = function (targetId, archive) {
            var indexOfItemToSave = $scope.upcomingConcerts.map(function (e) {
                return e._id;
            }).indexOf(targetId);
            var concert = {
                "_id": $scope.upcomingConcerts[indexOfItemToSave]._id,
                "name": $("#concertName" + targetId).text().trim(),
                "date": $("#concertDate" + targetId).data("initial-date"),
                "city": $("#concertCity" + targetId).text().trim(),
                "location": $("#concertLocation" + targetId).text().trim(),
                "programme": $("#concertProgramme" + targetId)[0].innerHTML.trim()
            };
            $.ajax({
                url: "manage/concerts/save",
                type: "POST",
                data: angular.toJson(concert),
                contentType: "application/json",
                success: function (id) {
                    $scope.upcomingConcerts[indexOfItemToSave] = concert;
                    concert._id = id;
                    $scope.$apply();
                    $scope.cancelConcertEdit(targetId);
                    showNotification('Edits saved');
                },
                error: function () {
                    showNotification('Concert couldn\'t be saved! :s', true);
                }
            });
        }

        $scope.addConcert = function () {
            var dateObj = {
                day: $scope.newConcert.dateAsString.split('.')[0],
                month: $scope.newConcert.dateAsString.split('.')[1],
                year: $scope.newConcert.dateAsString.split('.')[2],
            }
            var formattedDate = new Date(dateObj.year + '/' + dateObj.month + '/' + dateObj.day + ' 12:00:00');
            $scope.newConcert.date = formattedDate.getTime() / 1000;
            $.ajax({
                url: "manage/concerts/save",
                type: "POST",
                data: angular.toJson($scope.newConcert),
                contentType: "application/json",
                success: function (savedId) {
                    $("#concert0").fadeOut();
                    $scope.newConcert._id = savedId;
                    $scope.upcomingConcerts.push($scope.newConcert);
                    $scope.$apply();
                    $scope.newConcert = {
                        "id": 0
                    }
                    showNotification('Concert added!');
                },
                error: function () {
                    showNotification('Concert couldn\'t be saved! :s', true);
                }
            });
        }

        $scope.removeConcert = function (targetId) {
            $.confirm({
                template: 'warning',
                message: 'Remove this concert?',
                buttonOk: true,
                buttonCancel: true,
                labelOk: 'Remove',
                templateOk: 'primary-small',
                templateCancel: 'primary-small',
                onOk: function () {
                    $.ajax({
                        url: "manage/concerts/remove",
                        type: "POST",
                        data: {
                            _id: targetId
                        },
                        success: function () {
                            $("#" + targetId).fadeOut(function () {
                                $scope.upcomingConcerts = $scope.upcomingConcerts.filter(function (concert) {
                                    return concert.id !== targetId;
                                });
                                $scope.$apply();
                            });
                            showNotification('Concert removed');
                        },
                        error: function () {
                            showNotification('Concert couldn\'t be removed! :s', true);
                        }
                    });
                }
            });
        }

        $scope.countdownConcert = function (date) {
            var diff = Math.floor((new Date(date * 1000) - new Date()) / 86400000);
            if (diff > 0 && diff < 20) {
                if (diff < 7)
                    return " (in " + diff + " days)";
                if (diff >= 7 && diff < 14)
                    return " (in one week and " + diff - 7 + " days)";
                if (diff >= 14)
                    return " (in two weeks and " + (diff - 14) + " days)";
            }
        }

        $scope.getCountryByCity = function (city) {
            if (!city)
                return;
            if (city.indexOf('US') > -1 || city.toLowerCase().indexOf('u.s') > -1 || city.toLowerCase().indexOf('u.s.') > -1 || city.toLowerCase().indexOf('united') > -1)
                return 'us';
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

        $scope.$watch('newConcert.city', function (newValue, oldValue) {
            var oldFlag = $scope.getCountryByCity(oldValue);
            var newFlag = $scope.getCountryByCity(newValue);
            if (newFlag != oldFlag) {
                if (!newFlag) {
                    $("#newConcertFlag").hide();
                    return;
                }
                $("#newConcertFlag").show();
                $("#newConcertFlag").removeClass();
                $("#newConcertFlag").addClass('flag');
                $("#newConcertFlag").addClass('flag-' + newFlag);
            }
        });

        $scope.$watch('newConcert.dateAsString', function (newValue, oldValue) {
            if (!$scope.newConcert)
                return;
            $("#iconDateLowerThanToday").hide();
            var dateObj = {
                day: $scope.newConcert.dateAsString.split('.')[0],
                month: $scope.newConcert.dateAsString.split('.')[1],
                year: $scope.newConcert.dateAsString.split('.')[2],
            }
            var formattedDate = new Date(dateObj.year + '/' + dateObj.month + '/' + dateObj.day + ' 12:00:00');
            if (formattedDate < new Date() || isNaN(formattedDate.getTime())) {
                $("#iconDateLowerThanToday").show();
            }
        });
    })
    .controller('MediaController', function ($scope, mediaPhotosService, mediaVideosService) {
        init();

        function init() {
            selectMenuItem($('[href="#/media"]'));
            $('#newPhoto').hide();
            doFunkyStuffAndThenShowPage(function () {
                $("#newImage").change(function () {
                    $("#iconSaveWithLoading").removeClass();
                    $("#iconSaveWithLoading").addClass("fa fa-spinner fa-spin gold");
                    var data = new FormData();
                    data.append('image', $('#newImage')[0].files[0]);
                    $.ajax({
                        url: "manage/mediaPhotos/upload",
                        type: "POST",
                        data: data,
                        contentType: false,
                        processData: false,
                        success: function (newPhotoUrl) {
                            $("#iconSaveWithLoading").removeClass();
                            $("#iconSaveWithLoading").addClass('fa fa-upload');
                            $scope.mediaPhotos.push({
                                url: newPhotoUrl,
                                active: true,
                                alt: "Aurelia Visovan Carousel Image",
                                title: "Aurelia Visovan"
                            });
                            $scope.$apply();
                            $("#newPhoto").fadeOut();
                            showNotification('Image added');
                        },
                        error: function () {
                            $("#iconSaveWithLoading").removeClass();
                            $("#iconSaveWithLoading").addClass('glyphicon glyphicon-ok');
                            showNotification('Image couldn\'t be added! :s', true);
                        }
                    });
                });
            });
            mediaPhotosService.getMediaPhotos().then(function (mediaPhotos) {
                $scope.mediaPhotos = mediaPhotos;
                $("#divMediaPhotos").fadeIn();
            });
            mediaVideosService.getMediaVideos().then(function (mediaVideos) {
                $scope.mediaVideos = mediaVideos;
                $("#divMediaVideos").fadeIn();
            });
            $scope.myImage = '';
            $scope.myCroppedImage = '';

            var handleFileSelect = function (evt) {
                var file = evt.currentTarget.files[0];
                var reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function ($scope) {
                        $scope.myImage = evt.target.result;
                    });
                };
                reader.readAsDataURL(file);
            };
            angular.element(document.querySelector('#inputVideoImage')).on('change', handleFileSelect);

            $scope.newVideo = {
                title: 'Rick Astley - Never Gonna Give You Up',
                year: new Date().getFullYear(),
                ratio: '16by9',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            };
        }

        $scope.$watch('newVideo', function (newValue, oldValue) {
            var id = getVideoId(newValue.url);
            if (!newValue.title || !newValue.imageUrl || !id)
                $("#btnSaveNewVideo").addClass("disabled");
            else
                $("#btnSaveNewVideo").removeClass("disabled");
            if (id)
                $scope.newVideo.url = 'http://youtube.com/embed/' + id;
            else
                $scope.newVideo.url = '';
        }, true);

        function getVideoId(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            return (match && match[7].length == 11) ? match[7] : false;
        }

        $scope.removePhoto = function (id, url) {
            var icon = $("#iconRemoveWithLoading");
            icon.removeClass();
            icon.addClass("fa fa-spinner fa-spin gold");
            $.ajax({
                url: "manage/mediaPhotos/remove",
                type: "POST",
                data: {
                    _id: id,
                    url: url
                },
                success: function () {
                    $scope.mediaPhotos = $scope.mediaPhotos.filter(function (item) {
                        return item._id !== id;
                    });
                    $scope.$apply();
                    icon.removeClass();
                    icon.addClass("fa fa-remove");
                    showNotification('Photo removed');
                },
                error: function () {
                    icon.removeClass();
                    icon.addClass("fa fa-remove");
                    showNotification('Photo couldn\'t be removed! :s', true);
                }
            });
        };

        $scope.uploadVideoImage = function () {
            $.ajax({
                url: "manage/mediaVideos/upload",
                type: "POST",
                data: angular.toJson({
                    image: $scope.myCroppedImage
                }),
                contentType: "application/json",
                success: function (thumbnailUrl) {
                    showNotification('Video thumbnail added');
                    $scope.newVideo.imageUrl = thumbnailUrl;
                    $scope.$apply();
                    $("#modalAddImage").modal('hide');
                },
                error: function () {
                    showNotification('Video thumbnail couldn\'t be added! :s', true);
                }
            });
        };

        $scope.showNewVideo = function () {
            $scope.newVideo.title = 'Rick Astley - Never Gonna Give You Up',
                $scope.newVideo.year = new Date().getFullYear(),
                $scope.newVideo.ratio = '16by9',
                $scope.newVideo.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                $scope.newVideo.imageUrl = '';
            $('#divNewVideo').fadeIn();
        };

        $scope.cancelNewVideo = function () {
            $.ajax({
                url: "manage/mediaVideos/removeVideoImage",
                type: "POST",
                data: angular.toJson({
                    url: $scope.newVideo.imageUrl
                }),
                contentType: "application/json"
            });
            $("#divNewVideo").fadeOut();
        };

        $scope.saveNewVideo = function () {
            $.ajax({
                url: "manage/mediaVideos/save",
                type: "POST",
                data: angular.toJson($scope.newVideo),
                contentType: "application/json",
                success: function (newId) {
                    showNotification('New video added');
                    $scope.newVideo._id = newId;
                    $scope.mediaVideos.push($scope.newVideo);
                    $scope.$apply();
                    $("#divNewVideo").hide();
                },
                error: function () {
                    showNotification('New video couldn\'t be added! :s', true);
                    $("#divNewVideo").hide();
                }
            });
        };

        $scope.removeVideo = function (id, imageUrl) {
            $.confirm({
                template: 'warning',
                message: 'Remove this video?',
                buttonOk: true,
                buttonCancel: true,
                labelOk: 'Remove',
                templateOk: 'primary-small',
                templateCancel: 'primary-small',
                onOk: function () {
                    $.ajax({
                        url: "manage/mediaVideos/remove",
                        type: "POST",
                        data: {
                            _id: id,
                            imageUrl: imageUrl
                        },
                        success: function () {
                            $scope.mediaVideos = $scope.mediaVideos.filter(function (item) {
                                return item._id !== id;
                            });
                            $scope.$apply();
                            showNotification('Video removed');
                        },
                        error: function () {
                            showNotification('Video couldn\'t be removed! :s', true);
                        }
                    });
                }
            });
        }
    })
    .controller('RepertoireController', function ($scope, repertoireService) {
        init();

        function init() {
            selectMenuItem($('[href="#/repertoire"]'));
            repertoireService.getRepertoireItems().then(function (categories) {
                $scope.repertoireItems = categories;
                $scope.selectedCategory = $scope.repertoireItems.filter(function (item) {
                    return item.type == 2
                });
            });
            $scope.selectedCategoryIndex = 2;
            doFunkyStuffAndThenShowPage(function () {
                $scope.selectCategory(2);
                setTimeout(function () {
                    $('.repertoire-composer-title').not("#newComposerTitle").click(function () {
                        $('span:first', this).toggleClass('fa-chevron-down');
                        setTimeout(function () {
                            $(".new-composition").select();
                        }, 200);
                    })
                }, 700);
                setTimeout(function () {
                    $(".new-composition").keyup(function (e) {
                        if (e.keyCode == 13) {
                            login();
                        }
                    });
                }, 700);
                $(".like-input").click(function () {
                    return false;
                });
            });
        }

        $scope.selectCategory = function (id) {
            $(".btn-rectangle").removeClass('selected');
            $("#category" + id).addClass('selected', 'slow');
            $scope.selectedCategoryIndex = id;
        };

        $scope.addComposition = function (composerId) {
            $("#iconSaveWithLoading").removeClass();
            $("#iconSaveWithLoading").addClass("fa fa-spinner fa-spin gold");

            if ($scope.repertoireItems) {
                var selectedCategory = $scope.repertoireItems.filter(function (item) {
                    return item.type == $scope.selectedCategoryIndex
                });
            }
            var newComposition = $("#newComposition" + (composerId || "")).val();
            var composerToAddTo = $scope.repertoireItems.filter(function (item) {
                return item._id == composerId
            })[0];
            var itemExists = composerToAddTo.compositions.map(function (composition) {
                return composition;
            }).indexOf(newComposition);
            if (itemExists != -1) {
                $("#iconSaveWithLoading").removeClass();
                $("#iconSaveWithLoading").addClass('glyphicon glyphicon-ok');
                showNotification('Repertoire item already exists', true);
                return;
            }

            var backup = $scope.repertoireItems;
            var toSend = angular.copy(composerToAddTo);
            toSend.compositions.push(newComposition);
            $scope.repertoireItems = backup;
            $.ajax({
                url: "manage/repertoire/add",
                type: "POST",
                data: angular.toJson(toSend),
                contentType: "application/json",
                success: function () {
                    composerToAddTo.compositions.push(newComposition);
                    $scope.$apply();
                    $("#iconSaveWithLoading").removeClass();
                    $("#iconSaveWithLoading").addClass('glyphicon glyphicon-ok');
                    showNotification('Repertoire item added');
                },
                error: function () {
                    showNotification('Repertoire item couldn\'t be added! :s', true);
                }
            });
        };

        $scope.enableCompositionNameEdit = function (composerId, compositionId) {
            $("#btnEditCompositionName" + composerId + '7a6' + compositionId).hide();
            $("#btnSaveCompositionName" + composerId + '7a6' + compositionId).show();

            var $inputComposition = $("#compositionName" + composerId + '7a6' + compositionId);
            toggleContentEditable($inputComposition);
            $($inputComposition).focus();
            $($inputComposition).keydown(function (e) {
                if (e.keyCode == 13 && !e.shiftKey) {
                    e.preventDefault();
                }
            });
            $($inputComposition).keyup(function (e) {
                if (e.keyCode == 13 && !e.shiftKey) {
                    $scope.saveCompositionNameEdit(composerId, compositionId);
                }
            });
        };

        $scope.saveCompositionNameEdit = function (composerId, compositionId) {
            var newCompositionName = $("#compositionName" + composerId + '7a6' + compositionId).text().trim();;
            var composerToEditFrom = $scope.repertoireItems.filter(function (item) {
                return item._id == composerId
            })[0];
            var composerToEditFromToSend = angular.copy(composerToEditFrom);
            composerToEditFromToSend.compositions[compositionId] = newCompositionName;
            $.ajax({
                url: "manage/repertoire/add",
                type: "POST",
                data: angular.toJson(composerToEditFromToSend),
                contentType: "application/json",
                success: function () {
                    $("#btnEditCompositionName" + composerId + '7a6' + compositionId).show();
                    $("#btnSaveCompositionName" + composerId + '7a6' + compositionId).hide();
                    toggleContentEditable($("#compositionName" + composerId + '7a6' + compositionId));
                    composerToEditFrom.compositions[compositionId] = newCompositionName;
                    $scope.$apply();
                    showNotification('Repertoire item updated');
                },
                error: function () {
                    showNotification('Repertoire item couldn\'t be updated! :s', true);
                }
            });
        };

        $scope.removeComposition = function (composerId, compositionId) {
            var composerToRemoveFrom = $scope.repertoireItems.filter(function (item) {
                return item._id == composerId
            })[0];
            var composerToRemoveFromToSend = angular.copy(composerToRemoveFrom);
            composerToRemoveFromToSend.compositions.splice(compositionId, 1);
            $.ajax({
                url: "manage/repertoire/add",
                type: "POST",
                data: angular.toJson(composerToRemoveFromToSend),
                contentType: "application/json",
                success: function () {
                    composerToRemoveFrom.compositions.splice(compositionId, 1);
                    $scope.$apply();
                    showNotification('Repertoire item removed');
                },
                error: function () {
                    showNotification('Repertoire item couldn\'t be removed! :s', true);
                }
            });
        };

        $scope.addComposer = function () {
            var newComposer = {
                "type": $scope.selectedCategoryIndex,
                "composer": $("#newComposerName").text().trim(),
                "compositions": []
            };

            $scope.repertoireItems.unshift(newComposer);
            $("#newComposerDiv").fadeOut();
        };

        $scope.enableComposerNameEdit = function (composerId, $event) {
            if ($event.stopPropagation) $event.stopPropagation();
            $event.cancelBubble = true;
            $event.returnValue = false;

            $("#btnEditComposerName" + composerId).hide();
            $("#btnSaveComposerName" + composerId).show();

            toggleContentEditable($("#composerName" + composerId));
            $("#composerName" + composerId).focus();
            $("#composerName" + composerId).keydown(function (e) {
                if (e.keyCode == 13 && !e.shiftKey) {
                    e.preventDefault();
                }
            });
            $("#composerName" + composerId).keyup(function (e) {
                if (e.keyCode == 13 && !e.shiftKey) {
                    $scope.saveComposerNameEdit(composerId, $event);
                }
            });
        };

        $scope.saveComposerNameEdit = function (composerId, $event) {
            if ($event.stopPropagation) $event.stopPropagation();
            $event.cancelBubble = true;
            $event.returnValue = false;

            var composerToEdit = $scope.repertoireItems.filter(function (item) {
                return item._id == composerId
            })[0];
            composerToEdit.composer = $("#composerName" + composerId).text().trim();
            $.ajax({
                url: "manage/repertoire/add",
                type: "POST",
                data: angular.toJson(composerToEdit),
                contentType: "application/json",
                success: function () {
                    toggleContentEditable($("#composerName" + composerId));
                    $("#btnEditComposerName" + composerId).show();
                    $("#btnSaveComposerName" + composerId).hide();
                    showNotification('Composer name changed');
                },
                error: function () {
                    showNotification('Composer name couldn\'t be changed! :s', true);
                }
            });
        }

        $scope.removeComposer = function (id, $event) {
            if ($event.stopPropagation) $event.stopPropagation();
            $event.cancelBubble = true;
            $event.returnValue = false;

            $.confirm({
                template: 'warning',
                message: 'Remove this composer (and compositions)?',
                buttonOk: true,
                buttonCancel: true,
                labelOk: 'Remove',
                templateOk: 'primary-small',
                templateCancel: 'primary-small',
                onOk: function () {
                    var icon = $("#spanRemoveComposer");
                    icon.removeClass();
                    icon.addClass("fa fa-spinner fa-spin gold");
                    $.ajax({
                        url: "manage/repertoire/removeComposer",
                        type: "POST",
                        data: angular.toJson({
                            _id: id
                        }),
                        contentType: "application/json",
                        success: function () {
                            $scope.repertoireItems = $scope.repertoireItems.filter(function (item) {
                                return item._id !== id;
                            });
                            $scope.$apply();
                            icon.removeClass();
                            icon.addClass("fa fa-remove");
                            showNotification('Composer removed');
                        },
                        error: function () {
                            icon.removeClass();
                            icon.addClass("fa fa-remove");
                            showNotification('Composer couldn\'t be removed! :s', true);
                        }
                    });
                }
            });
        }
    });

avModule.filter("sanitize", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }

}]);

avModule.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

avModule.filter("concertsFilter", function () {
    return function (concerts, from) {
        var df = parseDate(from);
        var dt = parseDate(to);
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var tf = new Date(items[i].date1 * 1000),
                tt = new Date(items[i].date2 * 1000);
            if (tf > df && tt < dt) {
                result.push(items[i]);
            }
        }
        return result;
    };
});

function showNotification(notificationText, error) {
    if (!error) {
        $("#notificationTextSuccess").html(notificationText);
        $("#changesSaveSuccess").fadeIn();
        setTimeout(function () {
            $("#changesSaveSuccess").fadeOut();
        }, 2000);
    } else {
        $("#notificationTextError").html(notificationText);
        $("#changesSaveError").fadeIn();
        setTimeout(function () {
            $("#changesSaveError").fadeOut();
        }, 2000);
    }
}

function toggleContentEditable(item) {
    if ($(item).prop('contenteditable') == 'true') {
        $(item).prop('contenteditable', 'false');
        $(item).css('border', 'none');
    } else {
        $(item).prop('contenteditable', 'true');
        $(item).css('border', '1px solid rgba(255, 255, 255, 0.4)');
        $(item).css('padding', '10px');
    }
}

function createDate(date) {
    return new Date(date * 1000);
    //"dd.mm.yyyy"
}

function selectMenuItem(item) {
    $('.page-scroll').removeClass('selected');
    $(item).addClass('selected');
    $("#bs-example-navbar-collapse-1").collapse('hide')
}

function doFunkyStuffAndThenShowPage(stuffToDoAfter) {
    // $(".section-editor").show();
    // $('.intro-text').hide();
    // if (stuffToDoAfter)
    //     setTimeout(function () {
    //         stuffToDoAfter()
    //     }, 100);
    // return;

    $(".line-underline").css("right", "1500px");
    $(".line-underline").animate({
        right: -1500,
    }, 1000, function () {
        $(".section-editor").show('fast');
        $('.intro-text').hide();
    });
    if (stuffToDoAfter)
        setTimeout(function () {
            stuffToDoAfter()
        }, 1000);
};