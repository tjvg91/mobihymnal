// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function() {
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
        scrollSpeed: 1.00,
        textAlign: "left",
        fontSize: "18px",
        fontName: "Konsens",
        recentSize: 5,
        customizer: {
            fontName: 'Konsens',
            fontSize: '16px',
            fontClass: 'white',
            fontClassAdd: '',
            backType: 'color',
            backClass: '',
            backClassAdd: '',
            backImage: {
                src: '',
                size: 'auto'
            },
            backPos: {
                x: 0,
                y: 0
            }
        }
    }

    var winWidth, winHeight;
    var scrollAnimate = 0;
    var android, ios;

    var fontTypes = ['Konsens', 'Roboto', 'Tangerine', /*'Cookie', 'Gloria Hallelujah', 'Great Vibes', 'Indie Flower', 'Kaushan Script', 'Lobster', 'Pacifico', 'Rock Salt', 'Satisfy', 'Unifraktur Cook Bold', 'Clicker Script', 'Rancho', 'Parisienne', 'Pangolin', 'Petit Formal Script', 'Yesteryear', 'BerkshireSwash', 'Montez', 'Norican', 'Griffy'*/ ];

    var colorNames = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey', 'grey', 'black', 'white']

    var addColors = ['lighten-5', 'lighten-4', 'lighten-3', 'lighten-2', 'lighten-1', '', 'darken-1', 'darken-2', 'darken-3', 'darken-4', 'accent-1', 'accent-2', 'accent-3', 'accent-4']

    var backTypes = ['color', 'image'];

    var ngRepeats = [{
        html: '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-title="{{value.title}}" data-first-line="{{value.firstLine}}" data-hymnal="{{value.hymnalID}}" href="#lyrics">' +
            '<span class="mdl-list__item-primary-content">' +
            '<i class="fa fa-book mdl-list__item-avatar"></i><span>Hymn #{{value.title}}</span>' +
            '<span class="mdl-list__item-text-body">{{value.firstLine}}</span></span>' +
            '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action set-bookmark" href="#lyrics">' +
            '<i class="fa fa-bookmark-o" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}}"></i></a>' +
            '</span></li>',
        src: 'hymnList["hymnal" + settings.currentHymnal["id"]]'
    }, {
        html: '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-title="{{value.title}}" data-first-line="{{value.firstLine}}" data-hymnal="{{value.hymnalID}}" href="#lyrics">' +
            '<span class="mdl-list__item-primary-content">' +
            '<i class="fa fa-history mdl-list__item-avatar"></i><span>Hymn #{{value.title}}</span>' +
            '<span class="mdl-list__item-text-body">{{ value.firstLine }}</span></span>' +
            '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action set-bookmark" href="#">' +
            '<i class="fa fa-bookmark-o" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}}"></i></a>' +
            '</span></li>',
        src: 'recentList'
    }, {
        html: '<li class="mdl-list__item mdl-list__item--three-line" data-num="{{value.number}}" data-title="{{value.title}}" data-first-line="{{value.firstLine}}" data-hymnal="{{value.hymnalID}" href="#lyrics">' +
            '<span class="mdl-list__item-primary-content">' +
            '<i class="fa fa-bookmark mdl-list__item-avatar"></i><span>{{ value.firstLine }}</span>' +
            '<span class="mdl-list__item-text-body">Hymn #{{value.title}}</span></span>' +
            '<span class="mdl-list__item-secondary-content"><a class="mdl-list__item-secondary-action remove-bookmark">' +
            '<i class="fa fa-minus-circle" data-num="{{value.number}}" data-hymnal="{{value.hymnalID}}"></i></a>' +
            '</span></li>',
        src: 'bookmarksList'
    }, {
        html: '<tr data-num={{value.num}} href="#lyrics"><td class="mdl-data-table__cell--non-numeric">{{value.num}}</td><td class="mdl-data-table__cell--non-numeric">{{value.line}}</td></tr>',
        src: 'searchResList'
    }, {
        html: '<div class="card-container mdl-cell--6-col-desktop mdl-cell--4-col-tablet mdl-cell--12-col-phone">' +
            '<div class="mdl-card mdl-shadow--2dp card-front" data-color="{{value.color}}"><div class="mdl-card__title"><h2 class="mdl-card__title-text">{{value.name}}</h2></div>' +
            '<div class="mdl-card__supporting-text">{{value.count}} hymns</div>' +
            '<div class="mdl-card__actions mdl-card--border">' +
            '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple" href="#lyrics" data-id="{{value.id}}" data-num="1">' +
            'Read<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></a>' +
            '</div></div>' +
            '<div class="mdl-card mdl-shadow--2dp card-back" data-color="{{value.color}}" data-back="{{value.image}}">' +
            '</div>' +
            '</div>',
        src: 'hymnalList'
    }]

    var colorItem = '<li class="color"></li>'
    var backTypeItem = '<option></option>';
    var copiedText = "";

    var imageContainer = null;

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        
        navigator.splashscreen.hide();

        android = new RegExp('Android');
        ios = new RegExp('iPod|iPhone|iPad');

        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        document.addEventListener("searchbutton", onSearchKeyDown.bind(this), false);

        if (!ios.test(navigator.userAgent))
            document.addEventListener("backbutton", onBackButtonDown.bind(this), false);

        //keep awake
        window.plugins.insomnia.keepAwake();

        console.log('sulud1');
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        init();
        console.log('sulud2');
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    function onSearchKeyDown() {
        searchTerm($('#searchHymn').val());
    }

    function onBackButtonDown() {

    }

    var setUpNavigation = function() {
        if ($('.mdl-layout__content > section.active').children('.mdl-layout__tab-panel').length > 0) {
            $('.mdl-layout__tab-bar-container').show();
        } else {
            $('.mdl-layout__tab-bar-container').hide();
        }
        $('.mdl-layout__drawer .mdl-navigation__link').click(function(e) {
            e.preventDefault();
            goToSection(e.target);
            $('#drawerButton').trigger('click');
        });
    }

    var setUpTabs = function() {
        $('.mdl-layout__tab').click(function(e) {
            e.preventDefault();
            $('.mdl-layout__tab, .mdl-layout__tab-panel').removeClass('is-active');

            var target = $(e.target).attr('href');
            $(e.target).addClass('is-active');
            $(target).addClass('is-active');

            $(target).find('input').select();
            $(target).find('input').click();
        })
    }

    var setUpFireBase = function() {
        var options = {
            apiKey: "AIzaSyBgPT51lOzkH0Lwb63r0s4iQoyKgn2VuSY", // Auth / General Use
            authDomain: "mobihymn.firebaseapp.com", // Auth with popup/redirect
            databaseURL: "mobihymn.firebaseio.com", // Realtime Database
            storageBucket: "mobihymn.appspot.com", // Storage,
            messagingSenderId: "525477034225" // Cloud Messaging
        };
        // Initialize default application.
        firebase.initializeApp(options);
        firebase.auth().signInWithEmailAndPassword('tim.gandionco@gmail.com', 'tjvg1991').catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                firebase.auth().currentUser.getToken( /* forceRefresh */ true).then(function(idToken) {
                    getHymnalData('files/hymnals.json', idToken);
                }).catch(function(error) {
                    console.log(error);
                });

            }
        });
    }

    var setUpScroller = function() {
        $('.auto-scroller .add').click(function() {
            settings.scrollSpeed -= 50;
            setInterval(function() {
                var pos = $('#lyrics').scrollTop();
                $('#lyrics').scrollTop(pos + 2);
            }, settings.scrollSpeed);
        });
        $('.auto-scroller .minus').click(function() {
            settings.scrollSpeed += 50;
            setInterval(function() {
                var pos = $('#lyrics').scrollTop();
                $('#lyrics').scrollTop(pos + 2);
            }, settings.scrollSpeed);
        });
    }

    var setUpHymnals = function() {
        refreshNgRepeat('ngRepeats[4]');
        $('.cards .card-container').click(function(e) {
            var target = $(e.target);
            if (!target.is($('.cards .mdl-card a')) && !target.is('span.mdl-button__ripple-container')) {
                target = target.parents('.card-container'); //card-container
                target.addClass('flip');
                setTimeout(function() {
                    target.removeClass('flip');
                }, 1500);
            } else {
                e.preventDefault();
                $('#mySpinner').css('display', 'block');
                setTimeout(function() {
                    e.preventDefault();
                    if (!target.is('a.mdl-button'))
                        target = target.parents('a.mdl-button');
                    var curId = target.attr('data-id').trim();
                    settings.currentHymnal = Enumerable.From(hymnalList).Where(function(x) {
                        return x.id == curId;
                    }).Select(function(x) {
                        return x;
                    }).ToArray()[0];

                    settings.currentHymn = hymnList['hymnal' + settings.currentHymnal.id][0];
                    refreshNgRepeat('ngRepeats[0]');
                    $('#listHymns li').click(function(e1) {
                        setUpListItem(e1);
                    });

                    gotoHymn();
                    $('#mySpinner').css('display', 'none');
                    $('#drawerButton').css('display', 'block');
                    $('.mdl-layout__header-row').css('display', 'flex');
                }, 20)
            }

        })

        var dataBack = $('.cards [data-back]');
        if (dataBack) {
            dataBack.css('background-image', 'url("' + dataBack.attr('data-back') + '")');
        }
    }

    var toggleDialog = function(element, toggle) {
        element.toggle(toggle);
        $('.custom-obfuscator').toggle(toggle);
    }

    var setUpListItem = function(e) {
        e.preventDefault();
        var target = $(e.target);
        if (target.hasClass('fa-bookmark') || target.hasClass('fa-bookmark-o')) {
            var num = target.attr('data-num').trim();
            var hymnalID = target.attr('data-hymnal').trim();

            var data = Enumerable.From(hymnList["hymnal" + hymnalID]).Where(function(y) {
                return y.number == num && y.hymnalID == hymnalID;
            }).Select(function(x) { return x; }).ToArray()[0];

            if (target.hasClass('fa-bookmark-o')) {
                toggleBookmark(data, "add", target);
            } else {
                toggleBookmark(data, "remove", target);
            }
        } else if (target.hasClass('fa-minus-circle')) {
            var num = target.attr('data-num');
            var hymnalID = target.attr('data-hymnal');

            var data = Enumerable.From(hymnList["hymnal" + hymnalID]).Where(function(y) {
                return y.number == num && y.hymnalID == hymnalID;
            }).Select(function(x) { return x; }).ToArray()[0];

            toggleBookmark(data, "remove", target);
        } else
            gotoHymn(e);
    }

    var goToSection = function(element) {
        var target = null;
        if (element)
            target = $(element).attr('href');
        else
            target = "#lyrics";

        $('.mdl-layout__content > .page-content > section').removeClass('active');
        $(target).addClass('active');
        if (target == "#lyrics") {
            $('#btnInput, #btnPlay, #btnBookmark').removeClass('hidden');
        } else {
            $('#btnInput, #btnPlay, #btnBookmark').addClass('hidden');
        }
        if ($(target).children('.mdl-layout__tab-panel').length > 0) {
            $('.mdl-layout__tab-bar-container').show();
            $('.mdl-layout__tab-panel.is-active input').select();
        } else {
            $('.mdl-layout__tab-bar-container').hide();
        }
        if (target == "#home")
            $('.page-content').css('padding-bottom', '0');
        else
            $('.page-content').css('padding-bottom', '70px');
        if (target == '#customizer') {
            var width = $(target).find('.image-container').parent().width();
            $(target).find('.image-container').css({
                height: width + 'px'
            });
        }
        $('#btnCustomizer').addClass('hidden');
        $(target).scrollTop(0);
    }

    var getHymnalData = function(src, token) {
        $.ajax({
            url: src,
            method: "GET",
            dataType: "json",
            success: function(data) {
                hymnalList = data.output;
                setUpHymnals();
                hymnalList.forEach(function(value) {
                    $.ajax({
                        url: 'files/hymnal ' + value.id + '.json',
                        method: "GET",
                        dataType: "json",
                        async: false,
                        success: function(data2) {
                            hymnList['hymnal' + value.id] = data2;
                        }
                    })
                });

            },
            error: function (err) {
                console.log(err); 
                var storage = firebase.storage();
                var pathReference = storage.ref('hymnals.json').getDownloadURL().then(function(url) {
                    var a = $('<a></a>');
                    a.attr('download', '');
                    a.attr('href', url);
                    a.click(function(e) {
                        e.preventDefault();
                        console.log(e);
                    });
                    //$('body').append(a);
                    //a.trigger('click');
                    //a.remove();
                    //alert(url);

                    $.ajax({
                            method: "GET",
                            url: url,
                            dataType: "application/json",
                            beforeSend: function(xhr) {
                                xhr.setRequestHeader("Authorization", "Basic " + token);
                            },
                            success: function(data) {
                                console.log(data);
                            },
                            error: function(xhr, error, status) {
                                console.log(xhr);
                            }
                        })
                        //getHymnalData(url);
                })
            },
            complete: function() {
                $('.landing').fadeOut(800);
            }
        });
    }

    var dynamicSizes = function() {
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
        });

        var width = $('#customizer .image-container').parent().width();
        $('#customizer .image-container').css({
            height: width + 'px'
        });
    }

    var readDesription = function() {
        $.ajax({
            method: "GET",
            url: "texts/description.txt",
            success: function(data) {
                $('#description').html(data);
            }
        })
    }

    var readRevision = function() {
        $.ajax({
            method: "GET",
            url: "texts/revision.html",
            success: function(data) {
                $('#revision-list').html(data);
            }
        })
    }

    var startScrolling = function(elem) {
        stopScrolling();
        scrollAnimate = setInterval(function() {
            var pos = elem.scrollTop();
            elem.scrollTop(++pos);
            if (elem.scrollTop() + elem.innerHeight() >= elem[0].scrollHeight) {
                stopScrolling();
                $('#btnScroller i').toggleClass('fa-angle-double-down fa-stop');
            }
        }, 100 * settings.scrollSpeed);
    }

    var stopScrolling = function() {
        if (scrollAnimate > 0) {
            clearInterval(scrollAnimate);
            scrollAnimate = 0;
        }
    }

    var setValues = function() {
        $('button[data-align="' + settings.textAlign + '"]').addClass('mdl-button--raised');
        $('button[data-font="' + settings.fontName + '"]').addClass('mdl-button--raised');
        $('#hymnLyrics, #lyrics > .hymn-title').css({
            'fontSize': settings.fontSize + 'px',
            'fontFamily': settings.fontName,
            'textAlign': settings.textAlign
        });
        $('#lyrics > .hymn-title').css('fontSize', (settings.fontSize * 1.5) + 'px');
        $('#recentLength').val(settings.recentSize);
    }

    var getSelected = function() {
        var sel = '';
        if (window.getSelection) {
            sel = window.getSelection()
        } else if (document.getSelection) {
            sel = document.getSelection()
        } else if (document.selection) {
            sel = document.selection.createRange()
        }
        return sel;
    }

    var myToggleClass = function(elem, oldAddOn, newAddOn) {
        if (newAddOn) {
            if (oldAddOn)
                elem.toggleClass(newAddOn + ' ' + oldAddOn);
            else
                elem.toggleClass(newAddOn);
        } else if (oldAddOn)
            elem.toggleClass(oldAddOn);
    }

    var init = function() {
        winWidth = $(window).width();
        winHeight = $(window).height();

        console.log('sulud');

        //setUpFireBase();
        setUpNavigation();
        setUpTabs();
        dynamicSizes();
        readDesription();
        readRevision();
        getHymnalData('files/hymnals.json');
        setValues();

        var imageContainer = $('#customizer .image-container');

        delete Hammer.defaults.cssProps.userSelect;

        var contentElem = $('.mdl-layout__content > .page-content');
        var myHammer = new Hammer(contentElem[0]);
        myHammer.add(new Hammer.Swipe());
        myHammer.on("panright", function(ev) {
            if ($('header.mdl-layout__header').css('display') != "none" && $('#drawerButton').css('display') != 'none')
                $('#drawerButton').trigger('click');
        });

        var imgTextFontType = $('#imgTextFontType');
        fontTypes.forEach(function(value, index) {
            var option = $('<option value="' + value + '">' + value + '</option>');
            option.css('font-family', value);
            imgTextFontType.append(option);
        });
        imgTextFontType.val(settings.customizer.fontName);

        var palette = $('.palette');
        colorNames.forEach(function(value, index) {
            palette.each(function() {
                var li = $(colorItem);
                var target = $(this).attr('data-target');
                li.addClass(value);
                if ($(target).is('.image-container .text')) {
                    li.data('color', value + '-text');
                } else {
                    li.data('color', value);
                }
                li.attr('data-target', target);
                li.click(function() {
                    var target = $(this).attr('data-target');
                    var className = $(this).data('color');
                    if ($(target).is('.image-container .text')) {
                        if (settings.customizer.fontClass)
                            $(target).removeClass(settings.customizer.fontClass);
                        settings.customizer.fontClass = className;
                    } else {
                        if (settings.customizer.backClass)
                            $(target).removeClass(settings.customizer.backClass);

                        settings.customizer.backClass = className;
                    }
                    $(target).addClass(className);
                });
                $(this).append(li);
            })

        })

        imgTextFontType.change(function() {
            var val = $(this).val();
            imageContainer.find('.text').css('font-family', val);
            settings.customizer.fontName = val;
        });

        var backType = $('#backType');
        backTypes.forEach(function(value, index) {
            var option = $(backTypeItem);
            option.attr('value', value);
            option.text(value);
            backType.append(option);
        });
        backType.val(settings.customizer.backType);

        var hammerLyrics = new Hammer($('#lyrics')[0], {
            touchAction: 'pan-y'
        });
        hammerLyrics.get('pinch').set({
            enable: true
        })
        hammerLyrics.on('pinchmove pinchend', function(evt) {
            //evt.preventDefault();
            var orig_font = $('#hymnLyrics').css('font-size');
            switch (evt.type) {
                case 'pinchmove':
                    var newFont = fontSize * evt.scale;
                    if (newFont >= 18 && newFont <= 40) {
                        $('#hymnLyrics').css('font-size', newFont + 'px');
                        settings.font = newFont;
                    }
                    break;
                case 'pinchend':
                    fontSize = parseFloat($('#hymnLyrics').css('font-size'));
                    settings.font = fontSize;
            }
        });

        $('.mdl-textfield.mdl-textfield--expandable label').click(function() {
            $(this).parent().toggleClass('is-focused');
        });

        $('.mdl-textfield.mdl-textfield--expandable mdl-textfield__input').blur(function() {
            $(this).parent().toggleClass('is-focused');
        });

        $(window).resize(function() {
            dynamicSizes();
        })

        $('#btnInput').click(function(e) {
            e.preventDefault();
            goToSection(this);
        });

        $('#btnCustomizer').click(function(e) {
            e.preventDefault();
            var target = $(e.target);
            if (target.is('.fa-paint-brush'))
                target = target.parent();
            copiedText = getSelected().toString();
            copiedText = copiedText.replace(/[\n]/gm, '<br/>');
            $('#customizer .image-container .text').html(copiedText);
            goToSection(this);
            $(this).addClass('hidden');
        })

        var contentHeight = $(window).height() - $('.mdl-layout__header').height();
        $('.mdl-layout__content').css('height', '100%');
        $('.mdl-layout__content .page-content').css('height', '100%');

        $('.mdl-textfield input').on('keyup', function(e) {
            e.preventDefault();
            filterList(e);
        });

        $('#btnHome').click(function(e) {
            e.preventDefault();
            goToSection(this);
        });

        $('#searchHymn').focusin(function () {            
            var activeSection = $('.mdl-layout__content > .page-content > section.active');
            if (activeSection.attr('id') !== "search") {                
                $('#backer').data('active-section', activeSection.attr('id'));
                $('#backer').attr('href', '#' + activeSection.attr('id'));
                goToSection(this);
                $('#backer, #drawerButton, .search-clearer').toggle();
            }
        });

        $('#backer').click(function () {
            $('#backer, #drawerButton, .search-clearer').toggle();
            goToSection(this);
        });

        $('#searchHymn').keyup(function (e) {
            if (e.keyCode == "13") { //enter
                searchTerm($(this).val());
            }
        });

        hammerLyrics.on('tap', function(e) {
            if (e.tapCount == 1) {
                var target = $(e.target);
                if ($('#btnInput').hasClass('hidden')) {
                    $('.page-content').css('padding-bottom', '70px');
                } else {
                    $('.page-content').css('padding-bottom', '0px');
                }
                $('#mainHeader, #lyricFooter').toggle();
                $('#btnInput').toggleClass('hidden');
                copiedText = "";
                $('#btnCustomizer').addClass('hidden');
            }
        });

        hammerLyrics.on('pressup', function(e) {
            $('#btnCustomizer').toggleClass('hidden');
        })

        $('#rngScrollSpeed').change(function() {
            settings.scrollSpeed = parseFloat($(this).val()).toFixed(2);
            $('#scrollVal').text(settings.scrollSpeed);
            if ($('#btnScroller i').hasClass('fa-stop'))
                startScrolling($('#lyrics'));
        })

        $('#rngSpacing').change(function() {
            var elem = $(this);
            $('#hymnLyrics').css({
                'padding-bottom': (elem.val() + 10) + 'px'
            });
            $('#valSpacing').text(elem.val() + "px");
        })

        $('#rngLineHeight').change(function() {
            var elem = $(this);
            $('#hymnLyrics').css({
                'line-height': elem.val() + '%'
            });
        });

        $('#chkDropCap').change(function() {
            if (settings.textAlign == 'left') {
                if (this.checked) {
                    $('#hymnLyrics').addClass('indent-first-letter');
                } else {
                    $('#hymnLyrics').removeClass('indent-first-letter');
                }
            }
        })

        $('#btnBookmark').click(function(e) {
            e.preventDefault();
            var icon = $(this).find('.fa');
            if (icon.hasClass('fa-bookmark-o')) {
                toggleBookmark(settings.currentHymn, "add", icon);
            } else {
                toggleBookmark(settings.currentHymn, "remove", icon);
            }
            icon.toggleClass('fa-bookmark fa-bookmark-o');
        });

        $('.hymn-footer').click(function(e) {
            var target = $(e.target);
            if (!target.is('button')) {
                gotoHymn();
            }
        });

        $('#btnScroller').click(function() {
            var icon = $(this).find('i');
            if (icon.hasClass('fa-angle-double-down')) {
                icon.toggleClass('fa-angle-double-down fa-stop');
                startScrolling($('#lyrics'));
            } else {
                icon.toggleClass('fa-angle-double-down fa-stop');
                stopScrolling();
            }
        });

        $('.custom-obfuscator').click(function() {
            toggleDialog($('dialog').filter(function() {
                return $(this).css('display') != 'none';
            }), "hide");
        });

        $('button[data-align]').click(function() {
            $('button[data-align]').removeClass('mdl-button--raised');
            $(this).addClass('mdl-button--raised');
            var align = $(this).attr('data-align');
            $('#hymnLyrics, #lyrics > h2').css('text-align', align);

            var dropCap = $('#chkDropCap');
            if (align !== 'left') {
                if (dropCap[0].checked) {
                    dropCap.trigger('click');
                }
                dropCap.attr('disabled', 'disabled');
            } else
                dropCap.removeAttr('disabled');
        });

        $('#chkItalic').change(function() {
            var font;
            if (this.checked)
                font = 'Tangerine';
            else
                font = 'Konsens';
            $('#hymnLyrics, #lyrics > h2').css('font-family', font);
        });

        $('.search-clearer').click(function () {
            $(this).siblings('input').val('');
            $('#searchHymn').select();
        });
    }

    var refreshNgRepeat = function(item, prepend) {
        var ngRepeat = $('[ng-repeat="' + item + '"]');
        var ngRepeatColl = eval(eval(item)["src"]);

        ngRepeat.html('');
        if (ngRepeatColl.length > 0) {
            ngRepeatColl.forEach(function(value, index) {
                var itemString = eval(ngRepeat.attr('ng-repeat'))["html"];

                var regExpMatches = /(value\.[^\}]+)/img.exec(itemString);
                while (regExpMatches != null) {
                    itemString = itemString.replace(regExpMatches[0], eval(regExpMatches[0].trim()).trim()).trim();
                    regExpMatches = /(value\.[^\}]+)/img.exec(itemString);
                }
                itemString = itemString.replace(/\{\{/g, "");
                itemString = itemString.replace(/\}\}/g, "");
                var item = $(itemString);

                var dataBack = item.find('[data-back]');
                if (dataBack) {
                    dataBack.css({
                        'background-image': dataBack.attr('data-back')
                    })
                }
                if (prepend != undefined) {
                    if (!prepend)
                        ngRepeat.append(item);
                    else
                        ngRepeat.prepend(item);
                } else {
                    ngRepeat.append(item);
                }
                var icon = item.find('.fa-bookmark-o');
                var bkmkNum = icon.attr('data-num');
                var bkmkHymnal = icon.attr('data-hymnal');
                var bkmk = bookmarksList.find(function(value) {
                    return value.num == bkmkNum && value.hymnalID == bkmkHymnal;
                });

                if (bkmk) {
                    icon.innerText = "bookmark";
                }
            });
        }
    }

    var filterList = function(e) {
        var elem = $(e.target);
        var target = $(elem.attr('data-target'));
        var value = elem.val();

        target.find('li').css('display', 'flex');
        target.find('li').each(function() {
            if ($(this).attr('data-num').search(value) < 0 &&
                $(this).attr('data-title').search(value) < 0 &&
                $(this).attr('data-first-line').search(value) < 0) {
                $(this).css('display', 'none');
            }
        })
    }

    var gotoHymn = function(e) {
        var number;
        if (e) {
            var elem = $(e.currentTarget);
            number = elem.attr('data-num');
        } else {
            number = settings.currentHymn.num;
        }
        hymnList["hymnal" + settings.currentHymnal.id].forEach(function(value, index) {
            if (value.number == number) {
                settings.currentHymn = value;
                return;
            }
        });

        recentList.forEach(function(item, index) {
            if (item.number === settings.currentHymn.number && item.hymnalID === settings.currentHymn.hymnalID) {
                recentList.splice(index, 1);
                return;
            }
        });

        var recentLength = $("#recentLength").val();
        if (recentList.length >= recentLength) {
            recentList = recentList.slice((recentList.length - recentLength + 1), recentList.length);
        }
        recentList.push(settings.currentHymn);
        refreshNgRepeat('ngRepeats[1]', true);

        $('#listRecent li').click(function(e) {
            setUpListItem(e);
        })

        $('#hymnTitle, .current-hymn > .current-hymn-title').html(settings.currentHymn.title);
        $('#hymnLyrics').html(settings.currentHymn.lyrics);
        $('.mdl-card a[data-id="' + settings.currentHymnal.id + '"]').attr('data-num', number);
        goToSection(elem);
    }

    var searchTerm = function(searchTerm) {
        if (searchTerm) {
            if (searchTerm.trim() !== "") {
                var term = searchTerm.trim();
                $('#mySpinner').css('display', 'block');
                setTimeout(function() {
                    searchResList = [];
                    hymnList["hymnal" + settings.currentHymnal["id"]].forEach(function(x) {
                        if (new RegExp(term, "ig").test(x.lyrics)) {
                            var stanza = $(x.lyrics);
                            var lines = stanza.find('.hymn-line').filter(function(index, elem) {
                                return new RegExp(term, "i").test(elem.innerText)
                            });
                            lines.each(function(i, y) {
                                var item = {
                                    line: y.innerText,
                                    num: x.number
                                }

                                var dup = Enumerable.From(searchResList).Where(function(x) {
                                    return x.num == item.num && x.line == item.line;
                                }).Select(function(x) {
                                    return x
                                }).ToArray().length;

                                if (dup == 0)
                                    searchResList.push(item);
                            });
                        }
                    });

                    sortByProp(searchResList, "line");

                    refreshNgRepeat('ngRepeats[3]');

                    if (searchResList.length == 0) {
                        $('#searchTable').css('display', 'none');
                    } else {
                        $('#searchTable').css('display', 'table');
                    }

                    $('#searchCount').parent().css('display', 'block');
                    $('#searchCount').text(searchResList.length);

                    $('#mySpinner').css('display', 'none');
                    $('#searchTable tbody tr').click(function(e) {
                        gotoHymn(e);
                    });
                }, 10);
            }
        }
    }

    var toggleBookmark = function(data, mode, icon) {
        var icon2 = $('i.fa[data-num="' + data.number + '"][data-hymnal="' + data.hymnalID + '"]');
        if (mode == "add") {
            icon.text('bookmark');
            bookmarksList.push(data);
            $('#snckBookmark .mdl-snackbar__text').text('Bookmark added');
            $('#snckBookmark').addClass('mdl-snackbar--active');
            icon2.text('bookmark');
            setTimeout(function() {
                $('#snckBookmark').removeClass('mdl-snackbar--active');
            }, 3000);
        } else if (mode == "remove") {
            icon.text('bookmark_border');
            bookmarksList.forEach(function(item, index) {
                if (item.number === data.number && item.hymnalID === data.hymnalID) {
                    bookmarksList.splice(index, 1);
                    return;
                }
            });
            $('#snckBookmark .mdl-snackbar__text').text('Bookmark removed');
            $('#snckBookmark').addClass('mdl-snackbar--active');
            icon2.text('bookmark_border');
            setTimeout(function() {
                $('#snckBookmark').removeClass('mdl-snackbar--active');
            }, 3000);
        }
        refreshNgRepeat('ngRepeats[2]');

        $('#listBookmarks li').click(function(e1) {
            setUpListItem(e1);
        })
    }

    var sortByProp = function(list, prop) {
        list.sort(function(a, b) {
            var aName = a[prop].toLowerCase().replace(/^[^A-Za-z0-9]/g, "");
            var bName = b[prop].toLowerCase().replace(/^[^A-Za-z0-9]/g, "");
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        })
    }
})(jQuery);