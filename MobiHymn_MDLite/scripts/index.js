// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    var hymnList = {};
    var recentList = [];
    var bookmarksList = [];
    var hymnalList = [];

    var settings = {
        currentHymnal: {},
        currentHymn: {}
    }

    var ngRepeats = [{
        html : '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-title="{{value.title}}" data-first-line="{{value.firstLine}}" href="#lyrics">' + 
                    '<span class="mdl-list__item-primary-content">' +
                    '<i class="material-icons mdl-list__item-avatar">person</i><span>Hymn # {{ value.title }}</span>' +
                    '<span class="mdl-list__item-text-body">{{ value.firstLine }}</span></span>' + 
                    '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">bookmark_border</i></a>' +
                    '</span></li>',
        src: 'hymnList["hymnal" + settings.currentHymnal["id"]]'
    }, {
        html: '<li class="mdl-list__item mdl-list__item--three-line"><span class="mdl-list__item-primary-content">' +
                    '<i class="material-icons mdl-list__item-avatar">person</i><span>Hymn # {{ value.firstLine }}</span>' +
                    '<span class="mdl-list__item-text-body">{{ value.title }}</span></span>' +
                    '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">bookmark_border</i></a>' +
                    '</span></li>',
        src: 'recentList'
    }, {
        html: '<li class="mdl-list__item mdl-list__item--three-line"><span class="mdl-list__item-primary-content">' +
                    '<i class="material-icons mdl-list__item-avatar">person</i><span>Hymn # {{ value.firstLine }}</span>' +
                    '<span class="mdl-list__item-text-body">{{ value.title }}</span></span>' +
                    '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">bookmark_border</i></a>' +
                    '</span></li>',
        src: 'bookmarksList'
    }]

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        init();
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    function setUpLandingPage() {
        var winWidth = $(window).width();
        var winHeight = $(window).height();

        var landingWidth = $('.landing .title').width();
        var landingHeight = $('.landing .title').height();
        
        $('.landing .title').css({
            position: 'absolute',
            left: parseFloat((winWidth / 2) - (landingWidth / 2)).toFixed(2) + 'px',
            top: parseFloat((winHeight / 2) - (landingHeight / 2) - 40).toFixed(2) + 'px'
        });
    }

    function setUpNavigation() {
        if ($('.mdl-layout__content > section.active').children('.mdl-layout__tab-panel').length > 0) {
            $('.mdl-layout__tab-bar-container').show();
        }
        else {
            $('.mdl-layout__tab-bar-container').hide();
        }
        $('.mdl-layout__drawer .mdl-navigation__link').click(function (e) {
            goToSection(e.target);
            $('.mdl-layout__drawer-button').trigger('click');
        });
    }

    function setUpTabs() {
        $('.mdl-layout__tab').click(function (e) {
            $('.mdl-layout__tab, .mdl-layout__tab-panel').removeClass('is-active');

            var target = $(e.target).attr('href');
            $(e.target).addClass('is-active');
            $(target).addClass('is-active');
        })
    }

    function goToSection(element) {
        var target = $(element).attr('href');
        $('.mdl-layout__content > .page-content > section').removeClass('active');
        $(target).addClass('active');

        if (target == "#lyrics") {
            $('#btnInput, #btnPlay').removeClass('hidden');
        }
        else {
            $('#btnInput, #btnPlay').addClass('hidden');
        }
        if ($(target).children('.mdl-layout__tab-panel').length > 0) {
            $('.mdl-layout__tab-bar-container').show();
        }
        else {
            $('.mdl-layout__tab-bar-container').hide();
        }
    }

    function setUpFireBase() {
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

    function getHymnalData(src) {
        $.ajax({
            url: src,
            method: "GET",
            contentType: "json",
            success: function (data) {
                hymnalList = data.output;
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

                $('#listHymns li').click(function (e) {                
                    gotoHymn(e);
                })

                settings.currentHymnal = hymnalList[0];
                settings.currentHymn = hymnList['hymnal' + settings.currentHymnal.id][0];
                refreshNgRepeat('ngRepeats[0]');
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

    function init() {
        setUpFireBase();
        setUpLandingPage();
        setUpNavigation();
        setUpTabs();
        
        $('.mdl-textfield.mdl-textfield--expandable label').click(function () {
            $(this).parent().toggleClass('is-focused');
        });

        $('.mdl-textfield.mdl-textfield--expandable mdl-textfield__input').blur(function () {
            $(this).parent().toggleClass('is-focused');
        });

        $('#btnInput').click(function () {
            goToSection(this);
        });

        var contentHeight = $(window).height() - $('.mdl-layout__header').height();
        $('.mdl-layout__content').css('height', contentHeight + 'px');
        $('.mdl-layout__content .page-content').css('height', '100%');
        
        $('#inputNumber').on('keyup', function (e) {
            filterList(e);
        })  
    }

    function refreshNgRepeat(item) {
        var ngRepeat = $('[ng-repeat="' + item + '"]');
        var ngRepeatColl = eval(eval(ngRepeat.attr('ng-repeat'))["src"]);
        
        if (ngRepeatColl.length > 0) {
            ngRepeatColl.forEach(function (value, index) {
                var itemString = eval(ngRepeat.attr('ng-repeat'))["html"];

                var regExpMatches = /(value\.[^\}]+)/img.exec(itemString);
                while (regExpMatches != null) {
                    itemString = itemString.replace(regExpMatches[0], eval(regExpMatches[0]).trim());
                    regExpMatches = /(value\.[^\}]+)/img.exec(itemString);
                }
                itemString = itemString.replace(/\{\{/g, "");
                itemString = itemString.replace(/\}\}/g, "");
                var item = $(itemString);
                ngRepeat.append(item);
            });
        }
        else {
            ngRepeat.html('');
        }
    }

    function filterList(e) {
        console.log(e);

        var elem = $(e.target);
        var target = $(elem.attr('data-target'));
        var value = elem.val();
           
        target.find('li').css('display', 'flex');
        target.find('li').each(function () {
            if($(this).attr('data-num').search(value) < 0 &&
                $(this).attr('data-title').search(value) < 0 &&
                $(this).attr('data-first-line').search(value) < 0) {
                $(this).css('display', 'none');
            }
        })
    }

    function gotoHymn(e) {
        var elem = $(e.target);
        if (elem.tagName != 'LI') {
            elem = elem.parent();
        }
        if (elem.tagName != 'LI') {
            elem = elem.parent();
        }
        if (elem.tagName == "UL") {
            elem = elem.find("> li");
        }

        var number = elem.attr('data-num');
        
        hymnList["hymnal" + settings.currentHymnal.id].forEach(function (value, index) {
            if (value.number == number) {
                settings.currentHymn = value;
                return;
            }
        });
        
        $('#hymnTitle').html(settings.currentHymn.title);
        $('#hymnLyrics').html(settings.currentHymn.lyrics);

        goToSection(elem);
    }

    $(document).ready(function () {
        init();
    });
})(jQuery);