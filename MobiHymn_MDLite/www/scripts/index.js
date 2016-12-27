﻿// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    var hymnList = {};
    var recentList = [];
    var bookmarksList = [];
    var hymnalList = [];
    var searchResList = [];

    var settings = {
        currentHymnal: {},
        currentHymn: {},
        scrollSpeed: 250
    }

    var winWidth, winHeight;

    var ngRepeats = [{
        html: '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-title="{{value.title}}" data-first-line="{{value.firstLine}}" data-hymnal="{{value.hymnalID}" href="#lyrics">' +
                    '<span class="mdl-list__item-primary-content">' +
                    '<i class="material-icons mdl-list__item-avatar">person</i><span>Hymn # {{ value.title }}</span>' +
                    '<span class="mdl-list__item-text-body">{{ value.firstLine }}</span></span>' +
                    '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action set-bookmark" href="#lyrics">' +
                    '<i class="material-icons" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}}">bookmark_border</i></a>' +
                    '</span></li>',
        src: 'hymnList["hymnal" + settings.currentHymnal["id"]]'
    }, {
        html: '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}" href="#lyrics">' +
                    '<span class="mdl-list__item-primary-content">' +
                    '<i class="material-icons mdl-list__item-avatar">person</i><span>Hymn # {{ value.title }}</span>' +
                    '<span class="mdl-list__item-text-body">{{ value.firstLine }}</span></span>' +
                    '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action set-bookmark" href="#">' +
                    '<i class="material-icons" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}}">bookmark_border</i></a>' +
                    '</span></li>',
        src: 'recentList'
    },
    {
        html: '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}" href="#lyrics">' +
                    '<span class="mdl-list__item-primary-content">' +
                    '<i class="material-icons mdl-list__item-avatar">person</i><span>{{ value.firstLine }}</span>' +
                    '<span class="mdl-list__item-text-body">Hymn # {{ value.title }}</span></span>' +
                    '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action remove-bookmark">' +
                    '<i class="material-icons" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}}">remove_circle</i></a>' +
                    '</span></li>',
        src: 'bookmarksList'
    }, {
        html: '<tr data-num={{value.num}} href="#lyrics"><td class="mdl-data-table__cell--non-numeric">{{ value.num }}</td><td class="mdl-data-table__cell--non-numeric">{{ value.line }}</td></tr>',
        src: 'searchResList'
    }, {
        html: '<div class="mdl-card mdl-shadow--2dp" data-color="{{value.color}}"><div class="mdl-card__title"><h2 class="mdl-card__title-text">{{value.name}}</h2></div>' +
                '<div class="mdl-card__supporting-text">{{ value.count }} hymns</div>' +
                '<div class="mdl-card__actions mdl-card--border">' +
                '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple" href="#lyrics" data-id="{{ value.id }}" data-num="1">' +
                'Read<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></a>' +
                '</div></div>',
        src: 'hymnalList'
    }]

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        init();
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    var setUpLandingPage = function () {
        var landingWidth = $('.landing .title').width();
        var landingHeight = $('.landing .title').height();

        $('.landing .title').css({
            position: 'absolute',
            left: parseFloat((winWidth / 2) - (landingWidth / 2)).toFixed(2) + 'px',
            top: parseFloat((winHeight / 2) - (landingHeight / 2) - 20).toFixed(2) + 'px'
        });
    }

    var setUpNavigation = function () {
        if ($('.mdl-layout__content > section.active').children('.mdl-layout__tab-panel').length > 0) {
            $('.mdl-layout__tab-bar-container').show();
        }
        else {
            $('.mdl-layout__tab-bar-container').hide();
        }
        $('.mdl-layout__drawer .mdl-navigation__link').click(function (e) {
            e.preventDefault();
            goToSection(e.target);
            $('.mdl-layout__drawer-button').trigger('click');
        });
    }

    var setUpTabs = function () {
        $('.mdl-layout__tab').click(function (e) {
            $('.mdl-layout__tab, .mdl-layout__tab-panel').removeClass('is-active');

            var target = $(e.target).attr('href');
            $(e.target).addClass('is-active');
            $(target).addClass('is-active');
        })
    }

    var setUpFireBase = function () {
        var options = {
            apiKey: "AIzaSyBgPT51lOzkH0Lwb63r0s4iQoyKgn2VuSY",  // Auth / General Use
            authDomain: "mobihymn.firebaseapp.com",             // Auth with popup/redirect
            databaseURL: "mobihymn.firebaseio.com",             // Realtime Database
            storageBucket: "mobihymn.appspot.com",               // Storage,
            messagingSenderId: "525477034225"                      // Cloud Messaging
        };
        // Initialize default application.
        firebase.initializeApp(options);
        firebase.auth().signInWithEmailAndPassword('tim.gandionco@gmail.com', 'tjvg1991').catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                getHymnalData('files/hymnals.json');
            }
        });
    }

    var setUpScroller = function () {
        $('.auto-scroller .add').click(function () {
            settings.scrollSpeed -= 50;
            setInterval(function () {
                var pos = $('#lyrics').scrollTop();
                $('#lyrics').scrollTop(pos + 2);
            }, settings.scrollSpeed);
        });
        $('.auto-scroller .minus').click(function () {
            settings.scrollSpeed += 50;
            setInterval(function () {
                var pos = $('#lyrics').scrollTop();
                $('#lyrics').scrollTop(pos + 2);
            }, settings.scrollSpeed);
        });
    }

    var setUpHymnals = function () {
        refreshNgRepeat('ngRepeats[4]');

        $('.cards .mdl-card a').click(function (e) {
            $('#mySpinner').css('display', 'block');
            var elem = $(this);
            setTimeout(function () {
                e.preventDefault();
                var curId = elem.attr('data-id').trim();
                settings.currentHymnal = Enumerable.From(hymnalList).Where(function (x) {
                    return x.id == curId;
                }).Select(function (x) {
                    return x;
                }).ToArray()[0];

                settings.currentHymn = hymnList['hymnal' + settings.currentHymnal.id][0];
                refreshNgRepeat('ngRepeats[0]');
                $('#listHymns li').click(function (e1) {
                    setUpListItem(e1);
                });

                gotoHymn(e);
                $('#mySpinner').css('display', 'none');
                $('.mdl-layout__drawer-button[role="button"]').css('display', 'block');
                $('.mdl-layout__header-row').css('display', 'flex');
            }, 20)
        });
    }

    var setUpListItem = function (e) {
        e.preventDefault();
        var target = $(e.target);
        if (target.hasClass('material-icons') && /^bookmark_border$|^border$/.test(target.text())) {
            var num = target.attr('data-num');
            var hymnalID = target.attr('data-hymnal');

            var data = Enumerable.From(hymnList["hymnal" + hymnalID]).Where(function (y) {
                return y.number == num && y.hymnalID == hymnalID;
            }).Select(function (x) { return x; }).ToArray()[0];

            if (target.text() === "bookmark_border") {
                toggleBookmark(data, "add", target);
            } else {
                toggleBookmark(data, "remove", target);
            }
        }
        else if (target.hasClass('material-icons') && /^remove_circle$/.test(target.text())) {
            var num = target.attr('data-num');
            var hymnalID = target.attr('data-hymnal');

            var data = Enumerable.From(hymnList["hymnal" + hymnalID]).Where(function (y) {
                return y.number == num && y.hymnalID == hymnalID;
            }).Select(function (x) { return x; }).ToArray()[0];

            toggleBookmark(data, "remove", target);
        }
        else
            gotoHymn(e);
    }

    var goToSection = function (element) {
        var target = $(element).attr('href');
        $('.mdl-layout__content > .page-content > section').removeClass('active');
        $(target).addClass('active');

        if (target == "#lyrics") {
            $('#btnInput, #btnPlay, #btnBookmark, .auto-scroller').removeClass('hidden');
        }
        else {
            $('#btnInput, #btnPlay, #btnBookmark, .auto-scroller').addClass('hidden');
        }
        if ($(target).children('.mdl-layout__tab-panel').length > 0) {
            $('.mdl-layout__tab-bar-container').show();
        }
        else {
            $('.mdl-layout__tab-bar-container').hide();
        }
    }

    var getHymnalData = function (src) {
        $.ajax({
            url: src,
            method: "GET",
            contentType: "json",
            success: function (data) {
                hymnalList = data.output;
                setUpHymnals();
                hymnalList.forEach(function (value) {
                    $.ajax({
                        url: 'files/hymnal ' + value.id + '.json',
                        method: "GET",
                        contentType: "json",
                        async: false,
                        success: function (data2) {
                            hymnList['hymnal' + value.id] = data2;
                        }
                    })
                });

            },
            error: function (err) {
                var storage = firebase.storage();
                var pathReference = storage.ref('hymnals.json').getDownloadURL().then(function (url) {
                    var a = $('<a></a>');
                    a.attr('download', '');
                    a.attr('href', url);
                    a.click(function (e) {
                        e.preventDefault();
                        console.log(e);
                    });
                    $('body').append(a);
                    a.trigger('click');
                    $('body').remove(a);
                    //alert(url);
                    //getHymnalData(url);
                })
            },
            complete: function () {
                $('.landing').fadeOut(800);
            }
        });
    }

    var dynamicSizes = function () {
        winWidth = $(window).width();
        winHeight = $(window).height();
        $('#mySpinner').css({
            'position': 'fixed',
            'left': parseFloat((winWidth / 2) - (28 / 2)).toFixed(2) + 'px',
            'top': parseFloat((winHeight / 2) - (28 / 2) - 20).toFixed(2) + 'px',
            'z-index': 400,
            'display': 'none'
        });

        var scollerHeight = $('.auto-scroller').height();
        $('.auto-scroller').css({
            'position': 'fixed',
            'top': parseFloat((winHeight / 2) - (scollerHeight / 2)).toFixed(2) + 'px',
            'right': '5px'
        })
    }

    var init = function () {
        winWidth = $(window).width();
        winHeight = $(window).height();

        setUpFireBase();
        setUpLandingPage();
        setUpNavigation();
        setUpTabs();
        dynamicSizes();

        $('.mdl-textfield.mdl-textfield--expandable label').click(function () {
            $(this).parent().toggleClass('is-focused');
        });

        $('.mdl-textfield.mdl-textfield--expandable mdl-textfield__input').blur(function () {
            $(this).parent().toggleClass('is-focused');
        });

        $(window).resize(function () {
            dynamicSizes();
        })

        $('#btnInput').click(function (e) {
            e.preventDefault();
            goToSection(this);
        });

        var contentHeight = $(window).height() - $('.mdl-layout__header').height();
        $('.mdl-layout__content').css('height', contentHeight + 'px');
        $('.mdl-layout__content .page-content').css('height', '100%');

        $('#inputNumber').on('keyup', function (e) {
            e.preventDefault();
            filterList(e);
        });

        $('#btnHome').click(function (e) {
            e.preventDefault();
            goToSection(this);
        });

        $('#searchHymn').click(function () {
            $(this).data('active-section', $('main > .page-content > section.active').attr('id'));
            goToSection(this);
        });

        $('#searchHymn').blur(function () {
            if ($(this).val().trim() === "") {
                $(this).attr('href', '#' + $(this).data('active-section'));
                goToSection(this);
                $(this).attr('href', '#search');
            }
        });

        $('#searchHymn').keyup(function (e) {
            if (e.keyCode == "13") { //enter
                searchTerm($(this).val());
            }
        });

        $('#hymnLyrics').click(function () {
            $('header.mdl-layout__header').toggle();
            $('#btnPlay, #btnInput, .auto-scroller').toggleClass('hidden');
        })

        $('#rngSpacing').change(function () {
            var elem = $(this);
            $('#hymnLyrics').css({
                'padding-bottom': elem.val() + 'px'
            });
        })

        $('#btnBookmark').click(function (e) {
            e.preventDefault();
            var icon = $(this).find('.material-icons');
            if (icon.text() === "bookmark_border") {
                icon.text('bookmark');
                toggleBookmark(settings.currentHymn, "add", icon);
            } else {
                icon.text('bookmark_border');
                toggleBookmark(settings.currentHymn, "remove", icon);
            }
        });
    }

    var refreshNgRepeat = function (item, prepend) {
        var ngRepeat = $('[ng-repeat="' + item + '"]');
        var ngRepeatColl = eval(eval(item)["src"]);

        ngRepeat.html('');
        if (ngRepeatColl.length > 0) {
            ngRepeatColl.forEach(function (value, index) {
                var itemString = eval(ngRepeat.attr('ng-repeat'))["html"];

                var regExpMatches = /(value\.[^\}]+)/img.exec(itemString);
                while (regExpMatches != null) {
                    itemString = itemString.replace(regExpMatches[0], eval(regExpMatches[0].trim()).trim());
                    regExpMatches = /(value\.[^\}]+)/img.exec(itemString);
                }
                itemString = itemString.replace(/\{\{/g, "");
                itemString = itemString.replace(/\}\}/g, "");
                var item = $(itemString);
                if (prepend != undefined) {
                    if (!prepend)
                        ngRepeat.append(item);
                    else
                        ngRepeat.prepend(item);
                }
                else {
                    ngRepeat.append(item);
                }
            });
        }
    }

    var filterList = function (e) {
        var elem = $(e.target);
        var target = $(elem.attr('data-target'));
        var value = elem.val();

        target.find('li').css('display', 'flex');
        target.find('li').each(function () {
            if ($(this).attr('data-num').search(value) < 0 &&
                $(this).attr('data-title').search(value) < 0 &&
                $(this).attr('data-first-line').search(value) < 0) {
                $(this).css('display', 'none');
            }
        })
    }

    var gotoHymn = function (e) {
        var elem = $(e.currentTarget);

        var number = elem.attr('data-num');

        hymnList["hymnal" + settings.currentHymnal.id].forEach(function (value, index) {
            if (value.number == number) {
                settings.currentHymn = value;
                return;
            }
        });

        recentList.forEach(function (item, index) {
            if (item.number === settings.currentHymn.number && item.hymnalID === settings.currentHymn.hymnalID) {
                recentList.splice(index, 1);
                return;
            }
        });

        recentList.push(settings.currentHymn);

        refreshNgRepeat('ngRepeats[1]', true);

        $('#listRecent li').click(function (e) {
            setUpListItem(e);
        })

        $('#hymnTitle').html(settings.currentHymn.title);
        $('#hymnLyrics').html(settings.currentHymn.lyrics);

        goToSection(elem);
    }

    var searchTerm = function (term) {
        $('#mySpinner').css('display', 'block');
        setTimeout(function () {
            searchResList = [];
            hymnList["hymnal" + settings.currentHymnal["id"]].forEach(function (x) {
                if (new RegExp(term, "ig").test(x.lyrics)) {
                    var lines = x.lyrics.split('<br/>');
                    var line = Enumerable.From(lines).Where(function (y) {
                        return new RegExp(term, "ig").test(y);
                    }).Select(function (x) { return x; }).ToArray();

                    line.forEach(function (y) {
                        var item = {
                            line: y,
                            num: x.number
                        }

                        var dup = Enumerable.From(searchResList).Where(function (x) {
                            return x.num == item.num && x.line == item.line;
                        }).Select(function (x) {
                            return x
                        }).ToArray().length;

                        if (dup == 0)
                            searchResList.push(item);
                    });
                }
            });

            searchResList = Enumerable.From(searchResList).Distinct(function (x) { return [x.line, x.num]; }).Select(function (a) { return a; }).ToArray();

            refreshNgRepeat('ngRepeats[3]');

            if (searchResList.length == 0) {
                $('#searchTable').css('display', 'none');
            }
            else {
                $('#searchTable').css('display', 'table');
            }

            $('#searchCount').parent().css('display', 'block');
            $('#searchCount').text(searchResList.length);

            $('#mySpinner').css('display', 'none');
            $('#searchTable tbody tr').click(function (e) {
                gotoHymn(e);
            });
        }, 10);
    }

    var toggleBookmark = function (data, mode, icon) {
        if (mode == "add") {
            icon.text('bookmark');
            bookmarksList.push(data);
            $('#snckBookmark .mdl-snackbar__text').text('Bookmark added');
            $('#snckBookmark').addClass('mdl-snackbar--active');
            setTimeout(function () {
                $('#snckBookmark').removeClass('mdl-snackbar--active');
            }, 3000);
        }
        else if (mode == "remove") {
            icon.text('bookmark_border');
            bookmarksList.forEach(function (item, index) {
                if (item.num === data.num && item.hymnalID === data.hymnalID) {
                    bookmarksList.splice(index, 1);
                    return;
                }
            });
            $('#snckBookmark .mdl-snackbar__text').text; ('Bookmark removed');
            $('#snckBookmark').addClass('mdl-snackbar--active');
            setTimeout(function () {
                $('#snckBookmark').removeClass('mdl-snackbar--active');
            }, 3000);
        }
        refreshNgRepeat('ngRepeats[2]');

        $('#listBookmarks li').click(function (e1) {
            setUpListItem(e1);
        })
    }
})(jQuery);