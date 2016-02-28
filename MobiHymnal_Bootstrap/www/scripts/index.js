var isNew = true;
var hymn;
var num, instru = 'acoustic_grand_piano';
var fontName;
var fontSize;
var fontSizes = [18, 21, 24, 27, 30, 35, 40];

var arrNums = [];
var arrInstru = [];
var arrColors = [];

var resultType = 'any';
var wholeWord = false;
var matchCase = false;

var bookmarksPath = '';
var historyPath = '';
var settingsPath = '';

var storagePath = '';

var tempDate = "2016-01-01T00:00:00Z";

var theme = 'light';

var currentBack;

var player = null, audio = null;

var android;
var ios

var hist = {
    "history": [
        {
            "Num": 0,
            "Date": "2016-01-01T00:00:00Z"
        }
    ]
};

var settings = {
    "num": "",
    "font": "",
    "backColor": "",
    "theme": "",
    "pad": ""
}

var loaded = false;
var pluginLoaded = false;

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        android = new RegExp('Android');
        ios = new RegExp('iPod|iPhone|iPad');

        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

        document.addEventListener("searchbutton", onSearchKeyDown.bind(this), false);

        if(!ios.test(navigator.userAgent))
            document.addEventListener("backbutton", onBackButtonDown.bind(this), false);

        //keep awake
        window.plugins.insomnia.keepAwake();

        readDescription();
        readRevisions();

        listDirectory();
        loadSettings();

        num = settings.num;

        if (num == null)
            num = '1';

        hymn = $('#hymnNum');
        hymn.text(num);
        fontName = $('#lyrics').css('font-family');

        fontSize = settings.font;
        $('#content').css('font-size', fontSize + 'px');

        $('button[data-target="#searchWell"]').click(function () {
            $('button[data-target="#searchWell"] > i').toggleClass('mdi-hardware-keyboard-arrow-down mdi-hardware-keyboard-arrow-up')
        })

        $('a[href="#input"]').on('show.bs.tab', function (e) {
            isNew = true;
        });

        $('a[href="#search"]').on('shown.bs.tab', function (e) {
            $('#searchInput').focus();
            $('#searchInput').select();
            StatusBar.hide();
        });
        
        $('ul.nav-pills li a').on('shown.bs.tab', function (e) {
            var a = $(e.target).find('.text');
            
            if (a.text() === 'Home') {
                if ($('#bkmkAddRemove').hasClass('out'))
                    $('#bkmkAddRemove').toggleClass('out');
                if ($('.fab-menu').hasClass('out'))
                    $('.fab-menu').toggleClass('out');
            }
            else {
                if (!$('#bkmkAddRemove').hasClass('out'))
                    $('#bkmkAddRemove').toggleClass('out');
                if (!$('.fab-menu').hasClass('out'))
                    $('.fab-menu').toggleClass('out');
            }
            if (a.text() === 'Search') {
                if (!$('#searchPhrase').hasClass('out'))
                    $('#searchPhrase').toggleClass('out');
            }
            else {
                if ($('#searchPhrase').hasClass('out'))
                    $('#searchPhrase').toggleClass('out');
            }
        });

        $('a[href="#main"]').on('hidden.bs.tab', function (e) {
            if (!$('.fab-menu').hasClass('out'))
                $('.fab-menu').toggleClass('out');            
        });

        $('a[href="#main"]').on('shown.bs.tab', function (e) {
            window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
                dirEntry.getFile(bookmarksPath + '/' + hymn.text() + '.mbk', { create: false }, function (fileEntry) {
                    if ($('#bkmkAddRemove > i').hasClass('mdi-action-bookmark-outline'))
                        $('#bkmkAddRemove > i').toggleClass('mdi-action-bookmark-outline mdi-action-bookmark');
                },
                function (error) {
                    if ($('#bkmkAddRemove > i').hasClass('mdi-action-bookmark'))
                        $('#bkmkAddRemove > i').toggleClass('mdi-action-bookmark mdi-action-bookmark-outline');
                });
            }, function (error) {
                console.log(error.code);
            });

            if (hist.history.length == 0 || hist.history[hist.history.length - 1].Num != num) {
                hist.history.push({ "Num": num, "Date": tempDate });
                addHistory(num);
            }
            if (hist.history.length > 5) {
                hist.history.splice(0, 1);
                removeHistory();
            }
        });

        noUiSlider.create(document.getElementById('padSlider'), {
            animate: false,
            start: 0,
            range: {
                'min': 0,
                'max': 500
            },
            step: 10,
            orientation: 'horizontal',            
            pips: {
                mode: 'range',
                density: 3
            }
        });

        $('.rippler').rippler({            
            effectClass: 'rippler-effect',
            effectSize: 0,
            addElement: 'div',
            duration: 200
        });

        $('#searchInput').on('keyup', function (e) {
            var event = e || window.event;
            var keyPressed = event.keyCode || event.which;
            if (keyPressed == 13) {
                searchText($(this).val());
            }
            return true;
        });
        
        window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
            dirEntry.getFile(bookmarksPath + '/' + hymn.text() + '.mbk', { create: false }, function (fileEntry) {
                if ($('#bkmkAddRemove > i').hasClass('mdi-action-bookmark-outline'))
                    $('#bkmkAddRemove > i').toggleClass('mdi-action-bookmark-outline mdi-action-bookmark');
             },
                function (error) {
                    if ($('#bkmkAddRemove > i').hasClass('mdi-action-bookmark'))
                        $('#bkmkAddRemove > i').toggleClass('mdi-action-bookmark mdi-action-bookmark-outline');
            })
        },
            function (error) {
        });
        
        var pad = settings.pad;
        if (pad === null) pad = '0';
        $('#content').css('padding-bottom', pad + 'px');

        document.getElementById('padSlider').noUiSlider.set(pad);
        document.getElementById('padSlider').noUiSlider.on('change', function (e3) {
            $('#lyrics').css('padding-bottom', e3 + 'px');
            settings.pad = e3;
        })

        $('#optionsAny').click(function () {
            resultType = $(this).val();
        });

        $('#optionsFirstLine').click(function () {
            resultType = $(this).val();
        });

        $('#wholeWord').click(function (v) {
            wholeWord = !wholeWord;
        });

        $('#matchCase').click(function (v) {
            matchCase = !matchCase;
        });
        
        $('ul.nav-pills li a').click(function () {
            toggleCollapse();
        });

        var slide = true;
        $('#lyrics').click(function () {
            if (slide) {
                $('.navbar').slideUp({
                    duration: 200
                });
                $('.tab-pane').animate({
                    paddingTop: "-=50px"
                }, 200);
                
                if (!$('.fab-menu, .fab-main').hasClass('out'))
                    $('.fab-menu, .fab-main').toggleClass('out');
            }
            else {
                $('.navbar').slideDown({
                    duration: 200
                });
                $('.tab-pane').animate({
                    paddingTop: "+=50px"
                }, 200);
                if ($('.fab-menu, .fab-main').hasClass('out'))
                    $('.fab-menu, .fab-main').toggleClass('out');
            }
            slide = !slide;
        });

        var lyrics = document.getElementById('lyrics');
        var tabContent = document.getElementById('tabContent');

        delete Hammer.defaults.cssProps.userSelect;

        //Hammer.defaults.touchAction = 'pan-y';
        var hammerPanel = new Hammer.Manager(document.getElementById('slidingPanel'));
        hammerPanel.add(new Hammer.Swipe());
        hammerPanel.on('swipeleft', function (evt) {
            if ($('.side-collapse').hasClass('in')) {
                toggleCollapse();
            }
        });

        var hammerTab = new Hammer.Manager(tabContent, {
            touchAction: 'pan-y'
        });
        hammerTab.add(new Hammer.Swipe());
        hammerTab.on('swiperight', function (evt) {
            if (!$('.side-collapse').hasClass('in')) {
                toggleCollapse();
            }
        });

        var hammerOverlay = new Hammer.Manager(document.getElementById('blackOverlay'));
        hammerOverlay.add(new Hammer.Swipe());
        hammerOverlay.on('swipeleft', function (evt) {
            if ($('.side-collapse').hasClass('in')) {
                toggleCollapse();
            }
        });

        var hammerLyrics = new Hammer(lyrics, {
            touchAction: 'pan-y'
        });
        hammerLyrics.get('pinch').set({
            enable: true
        })
        hammerLyrics.on('pinchmove pinchend', function (evt) {
            //evt.preventDefault();
            var orig_font = $('#content').css('font-size');
            switch (evt.type) {
                case 'pinchmove':
                    var newFont = fontSize * evt.scale;
                    if (newFont >= 18 && newFont <= 40) {
                        $('#content').css('font-size', newFont + 'px');
                        settings.font =  newFont;
                    }
                    break;
                case 'pinchend':
                    fontSize = parseFloat($('#content').css('font-size'));
                    settings.font = fontSize;
            }
        });
        
        var midiPlayPause = document.getElementById('midiPlayPause');
        var hammerPlayer = new Hammer.Manager(midiPlayPause);
        hammerPlayer.add(new Hammer.Tap());
        hammerPlayer.add(new Hammer.Tap({
            event: 'singleTap',
            taps: 1
        }));
        hammerPlayer.add(new Hammer.Tap({
            event: 'doubleTap',
            taps: 2
        }));

        hammerPlayer.get('singleTap').recognizeWith('tap');
        hammerPlayer.get('doubleTap').recognizeWith('tap');
        
        hammerPlayer.on('singleTap doubleTap', function (evt) {
            if (evt.type === 'singleTap') {
                playPause(hymn.text());
            }
            else if(evt.type === 'doubleTap'){
                if (MIDI.Player.playing) {
                    MIDI.Player.stop();
                    $('#midiPlayPause > i').toggleClass('mdi-av-play-arrow mdi-av-pause');
                }
            }
        });

        if (hist.history.length > 0) {
            if (hist.history[0].Num == '0')
                hist.history.splice(0, 1);
        }
        if (hist.history.length == 0 || hist.history[hist.history.length - 1].Num != num) {
            hist.history.push({ "Num": num, "Date": tempDate });
            addHistory(num);
        }
        if (hist.history.length > 5) {
            hist.history.splice(0, 1);
            removeHistory();
        }

        currentBack = 'primary';
        $('.color-palette > .color').each(function () {
            var color = $(this).text();
            $(this).css({
                'background-color': color,
                'text-indent': '100%',
                'white-space': 'nowrap',
                'overflow': 'hidden'
            });
        });

        $('.color-palette .color').click(function () {
            if (!$(this).hasClass('active')) {
                $('.color-palette > .color').removeClass('active');
                $(this).addClass('active');

                var curColor = $(this).text();

                var newColor = Enumerable.From(arrColors).Where(function (x) {
                    return x.value === curColor;
                }).Select(function (x) {
                    return x.name;
                }).ToArray()[0];

                $('.navbar').toggleClass('navbar-' + currentBack + ' navbar-' + newColor);
                $('.btn-' + currentBack).toggleClass('btn-' + currentBack + ' btn-' + newColor);
                $('.panel-' + currentBack).toggleClass('panel-' + currentBack + ' panel-' + newColor);
                $('.checkbox-' + currentBack).toggleClass('checkbox-' + currentBack + ' checkbox-' + newColor);
                $('.togglebutton-' + currentBack).toggleClass('togglebutton-' + currentBack + ' togglebutton-' + newColor);
                $('.slider-' + currentBack).toggleClass('slider-' + currentBack + ' slider-' + newColor);
                $('.radio-' + currentBack).toggleClass('radio-' + currentBack + ' radio-' + newColor);
                $('.text-' + currentBack).toggleClass('text-' + currentBack + ' text-' + newColor);
                $('.side-collapse-' + currentBack).toggleClass('side-collapse-' + currentBack + ' side-collapse-' + newColor);

                currentBack = newColor;

                settings.backColor = currentBack;
            }
        });

        if (settings.theme != null) {
            theme = settings.theme;
            if (theme === 'dark') {
                $('#optionDark').trigger('click');
            }
        }

        if (settings.backColor != null) {
            var newCol = settings.backColor;

            var newColorRGB = Enumerable.From(arrColors).Where(function (x) {
                return x.value === newCol;
            }).Select(function (x) {
                return x.rgbValue;
            }).ToArray()[0];

            $('.color').filter(function () {
                return $(this).text() === newCol;
            }).trigger('click');
        }

        getLyrics(num);
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
        saveHistory();
        saveSettings();
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    function onSearchKeyDown() {
        // Handle the search button
        searchText($('#searchInput').val());
    }

    function onBackButtonDown() {
    }
})();

function getLyrics(num) {
    settings.num = num;
    var out = Enumerable.From(arrNums)
						.Where(function (x) { return x.Num == num  })
						.Select(function (x) { return x; }).ToArray();
    $('#lyrics').html(out[0].Lyrics);
    $('#title').addClass('text-' + currentBack);
    if (audio != null) {        
        if ($('#midiPlayPause > i').hasClass('mdi-av-pause')) {
            console.log('sulud');
            audio.pause();
        }
        audio = null;
    }
};

function readDescription() {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "texts/description.txt", false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var regex = new RegExp('\\r\\n', 'g');
                allText = allText.replace(regex, '<br/>');
                $('#about').text(allText);
            }
        }
    }
    rawFile.send(null);

};

function readRevisions() {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "texts/revision.html", false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var regex = new RegExp('\\r\\n', 'g');
                allText = allText.replace(regex, '<br/>');
                $('#new').html(allText);
            }
        }
    }
    rawFile.send(null);

};

function typeNum(target)
{
    if (isNew) {
        if (target != 'b' && target != 'f' && target != 's' && target != 't' && target != 'e' && target != '0') {
            hymn.html(target);
            isNew = false;
        }
        else if (target == 'e') {
            getLyrics(hymn.text());
            $('.nav-tabs a[href="#main"]').tab('show');
            settings.num = hymn.text();
        }
    }
    else
    {
        if (target != 'b' && target != 'e') {            
            hymn.html(hymn.text() + target);
        }
        else if (target == 'b') {
            hymn.html(hymn.text().substr(0, hymn.text().length - 1));
            if (hymn.text().length == 0) {
                hymn.text('1');
                isNew = true;
            }
        }
        else if (target == 'e') {
            getLyrics(hymn.text());
            settings.num = hymn.text();
            num = hymn.text();
            goToHymn();
        }
    }
}

function goToHymn()
{
    $('.nav-pills a[href="#main"').tab('show');
}

function gotoSearch() {
    $('.nav-pills a[href="#search').tab('show');
}

function gotoInput() {
    $('.nav-pills a[href="#input').tab('show');
}

function searchText(text) {    
    var searchDiv = $('#searchResults');
   
    if (searchDiv.has('div.table-responsive'))
        $('div.table-responsive').remove();

    var listGroup = $('<div></div>');
    listGroup.addClass('list-group');

    var divTable = $('<div></div>');
    divTable.addClass('table-responsive');

    var table = $('<table></table>');
    table.addClass('table');

    var header = $('<thead></thead>');
    
    var headerRow = $('<tr></tr>');

    var headerNum = $('<th></th>');
    headerNum.text('Num');
    headerNum.css('width', '20%');
    headerNum.css('text-align', 'center');

    var headerLine = $('<th></th>');
    headerLine.text('Line');
    headerLine.css('width', '80%');
    headerLine.css('text-align', 'center');

    headerRow.append(headerNum);
    headerRow.append(headerLine);
    header.append(headerRow);
    table.append(header);

    var body = $('<tbody></tbody>');
    
    if (resultType == 'firstLine') {
        var out = Enumerable.From(arrNums)
						.Where(function (x) {
						    var compare1 = matchCase ? x.FirstLine : x.FirstLine.toLowerCase();
						    var compare2 = matchCase ? text : text.toLowerCase();
						    var searchText = wholeWord ? "\\b" + compare2 + "\\b" : compare2;
						    return compare1.search("\\b" + compare2 + "\\b") >= 0
						})
						.Select(function (x) { return x; }).ToArray();
        $('#searchCount').html(out.length + ' result(s) found');
        out.sort(sort_by('FirstLine', true, function (a) { return a; }));
        $.each(out, function (index, element) {
            var bodyRow = $('<tr></tr>');

            var bodyNum = $('<td></td>');
            bodyNum.css('width', '20%');

            var aNum = $('<a></a>')
            aNum.addClass('text-' + currentBack);
            aNum.text(element.Num);            
            aNum.click(function () {
                num = element.Num;
                hymn.text(aNum.text());
                getLyrics(hymn.text());
                goToHymn();
            });
            bodyNum.append(aNum);

            var bodyLine = $('<td></td>');
            bodyLine.css('width', '80%');

            var aLine = $('<a></a>');
            aNum.addLine('text-' + currentBack);
            aLine.text(element.firstLine);
            aLine.click(function () {
                num = element.Num;
                hymn.text(element.Num);
                getLyrics(hymn.text());
                goToHymn();
            });
            bodyLine.append(aLine);

            bodyRow.append(bodyNum);
            bodyRow.append(bodyLine);

            body.append(bodyRow);
        });
        table.append(body);
        table.tablesorter({
            sortList: [[1, 0]]
        });
        divTable.append(table);
        searchDiv.append(divTable);
    }
    else {
        if (text.toLowerCase().startsWith('the ')) {
            text = text.replace('the ', '');
            text = text.replace('The ', '');
        }
        var out = Enumerable.From(arrNums)
						.Where(function (x) {
						    var compare1 = matchCase ? x.Lyrics : x.Lyrics.toLowerCase();
						    var compare2 = matchCase ? text : text.toLowerCase();
						    var searchTerm = wholeWord ? "\\b" + compare2 + "\\b" : compare2;
						    var tags = x.Tags.split(';');
						    var cleanTags = [];
						    $.each(tags, function (index, element) {
						        cleanTags.push(element.trim());
						    });
						    return compare1.search(searchTerm) >= 0 || cleanTags.indexOf(searchTerm.toLowerCase()) >= 0
						})
						.Select(function (x) { return x; }).ToArray();
        var arrs = [];
        var arrs2 = [];
        
        $.each(out, function (index, element) {
            var compare1 = matchCase ? element.Lyrics : element.Lyrics.toLowerCase();
            var compare2 = matchCase ? text : text.toLowerCase();
            var searchTerm = wholeWord ? "\\b" + compare2 + "\\b" : compare2;
            if (compare1.search(searchTerm) < 0) {
                if (arrs.indexOf(element.FirstLine) >= 0 && arrs2.indexOf(element.Num) >= 0)
                    return true;

                arrs.push(element.FirstLine);
                arrs2.push(element.Num);

                var bodyRow = $('<tr></tr>');

                var bodyNum = $('<td></td>');
                bodyNum.css('width', '20%');
                bodyNum.css('padding-left', '15px');

                var aNum = $('<a></a>')
                aNum.addClass('text-' + currentBack);
                aNum.text(element.Num);
                aNum.click(function () {
                    hymn.text(aNum.text());
                    num = hymn.text();
                    getLyrics(hymn.text());
                    goToHymn();
                });
                bodyNum.append(aNum);

                var bodyLine = $('<td></td>');
                bodyLine.css('width', '80%');

                var aLine = $('<a></a>');
                aLine.addClass('text-' + currentBack);
                aLine.text(element.FirstLine);
                aLine.click(function () {
                    hymn.text(element.Num);
                    num = hymn.text();
                    getLyrics(hymn.text());
                    goToHymn();
                });
                bodyLine.append(aLine);

                bodyRow.append(bodyNum);
                bodyRow.append(bodyLine);

                body.append(bodyRow);
            }
            else {
                var arrSplit = element.Lyrics.split('<br/>');
                var res = Enumerable.From(arrSplit)
                    .Where(function (x) {
                        var comp = matchCase ? x : x.toLowerCase();
                        return comp.search(searchTerm) >= 0;
                    })
                    .Select(function (x) {
                        return x;
                    }).ToArray();
                $.each(res, function(index1, element1){
                    var line = element1;
                    if (line.indexOf("<div id=\"content\">") > 0) {
                        line = line.replace("<div id=\"content\">", "");
                    }

                    if (line.indexOf("a id=\"title\"") > 0) {
                        var substr = line.substring(line.indexOf('a id="title"') - 1, line.indexOf('</a>') + 5)
                        line = line.replace(substr, "");
                    }
                    if (line.indexOf("</div>") > 0) {
                        line = line.replace("</div>", "");
                    }
                    if (line.indexOf("div")) {
                        line = line.replace("<div>", "");
                    }

                    if (arrs.indexOf(line) >= 0 && arrs2.indexOf(element.Num) >= 0)
                        return true;

                    arrs.push(line);
                    arrs2.push(element.Num);

                    var bodyRow = $('<tr></tr>');

                    var bodyNum = $('<td></td>');
                    bodyNum.css('width', '20%');
                    bodyNum.css('padding-left', '15px');

                    var aNum = $('<a></a>');
                    aNum.addClass('text-' + currentBack);
                    aNum.text(element.Num);
                    aNum.click(function () {
                        hymn.text(aNum.text());
                        num = hymn.text();
                        getLyrics(hymn.text());
                        goToHymn();
                    });
                    bodyNum.append(aNum);

                    var bodyLine = $('<td></td>');
                    bodyLine.css('width', '80%');

                    var aLine = $('<a></a>');
                    aLine.addClass('text-' + currentBack);
                    aLine.text(line);
                    aLine.click(function () {
                        hymn.text(element.Num);
                        num = hymn.text();
                        getLyrics(hymn.text());
                        goToHymn();
                    });
                    bodyLine.append(aLine);

                    bodyRow.append(bodyNum);
                    bodyRow.append(bodyLine);

                    body.append(bodyRow);                    
                });
            }
        });
        table.append(body);
        
        table.tablesorter({
            sortList: [[1, 0]]
        });

        divTable.append(table);
        searchDiv.append(divTable);
        arrs = [];
        arrs2 = [];
        //$('#searchCount').html(arrs.length === undefined ? 0 : arrs.length + ' result(s) found');
    }    
}

function playPause(number) {    
    if ($('#midiPlayPause > i').hasClass('mdi-av-play-arrow')) {
        console.log(cordova.file.applicationDirectory);
        var s = '';
        if (audio == null) {
            var loc = cordova.file.applicationDirectory;
            if(loc.startsWith('file://'))
                loc = loc.replace('file://', '');
            audio = new Audio('/android_asset/www/midi/files/h' + number + '.mid');
            if (audio.ended)
                $('#midiPlayPause > i').toggleClass('mdi-av-play-arrow mdi-av-pause');
            audio.onreset = function (e) {
                $('#midiPlayPause > i').toggleClass('mdi-av-play-arrow mdi-av-pause');
                cordova.plugins.notification.local.cancel(1, function () {
                    // Notification was cancelled
                });
            }
            audio.onplay = function (e) {
                $('#midiPlayPause > i').toggleClass('mdi-av-play-arrow mdi-av-pause');
            }
            audio.onpause = function (e) {
                $('#midiPlayPause > i').toggleClass('mdi-av-play-arrow mdi-av-pause');
            }

            audio.play();
            audio.onerror = function (e) {
                createToast('MIDI file not found.');
                console.log(e.error);
                $('#midiPlayPause > i').toggleClass('mdi-av-play-arrow mdi-av-pause');
                audio = null;
            }
        }
        else {
            audio.play();
            //player.play();
        }   
    }
    else {
        audio.pause();
        //player.pause();
    }
}

function bookmarkNot() {
    if ($('#bkmkAddRemove > i').hasClass('mdi-action-bookmark-outline')) {
        window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
            dirEntry.getFile(bookmarksPath + '/' + hymn.text() + '.mbk', { create: true }, function (fileEntry) {
            }, function (error) {
            });
        });
        $('#bkmkAddRemove > i').toggleClass('mdi-action-bookmark-outline mdi-action-bookmark');
        createToast('Bookmark added');
    }
    else {
        window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
            dirEntry.getFile(bookmarksPath + '/' + hymn.text() + '.mbk', { create: false }, function (fileEntry) {
                fileEntry.remove();
            }, function (error) {
            });
        });
        $('#bkmkAddRemove > i').toggleClass('mdi-action-bookmark-outline mdi-action-bookmark');
        createToast('Bookmark removed');
    }

    $('#bookmarks > .list-group-item').remove();
    getBookmarks();
}

function myHymns(arr) {
    arrNums = arr;
}

function myInstruments(arr) {
    arrInstru = arr;
}

function myColors(arr) {
    arrColors = arr;
}

var sort_by = function (field, reverse, primer) {
    var key = function (x) { return primer ? primer(x[field]) : x[field] };

    return function (a, b) {
        var A = key(a), B = key(b);
        return ((A < B) ? -1 : ((A > B) ? 1 : 0)) * [-1, 1][+!!reverse];
    }
}

function listDirectory() {
    if (android.test(navigator.userAgent)) {        
        storagePath = cordova.file.externalRootDirectory;
    }
    else if (ios.test(navigator.userAgent)) {
        storagePath = cordova.file.dataDirectory;
    }

    bookmarksPath = '/MobiHymnal/files/bookmarks';
    historyPath = '/MobiHymnal/files/history.json';
    settingsPath = '/MobiHymnal/settings.json';

    getBookmarks();
    getHistory();
}

function getBookmarks() {
    window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
        dirEntry.getDirectory(bookmarksPath, { create: true }, function (dirEntry) {
            var directoryReader = dirEntry.createReader();
            directoryReader.readEntries(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    addBookmark(entries[i].name);
                }
            },
            function (error) {
                console.log(error.code);
            });
        }, function (error) {
            console.log(error.code);
        });
    });
}

function getHistory() {
    window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
        dirEntry.getFile(historyPath, { create: true }, function (fileEntry) {
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    var text = evt.target.result;
                    if (text != undefined && text.trim() != "") {
                        hist.history.splice(0, hist.history.length);
                        hist = JSON.parse(text);
                        $('#history > .list-group-item').remove();
                        hist.history.forEach(function (element) {
                            addHistory(element.Num);
                        });
                    }
                };
                reader.readAsText(file);
            }, function(error){
                console.log(error.code);
            });
            
        }, function (error) {
            console.log(error.code);
        });
    });
}

function addHistory(number) {
    var a = $('<a></a>');
    a.addClass('list-group-item');
    a.addClass('rippler');
    a.addClass('rippler-inverse');

    var icon = $('<i></i>');
    icon.addClass('mdi-action-history');

    var divPrimary = $('<div></div>');
    divPrimary.addClass('row-action-primary');
    divPrimary.append(icon);

    var title = $('<h4></h4>');
    title.addClass('list-group-item-heading');
    var num = number;
    var lineText = Enumerable.From(arrNums)
						.Where(function (x) { return x.Num == number })
						.Select(function (x) { return x; }).ToArray()[0].FirstLine;
    a.click(function () {
        var text = $(this).children('div.row-content').children('h4').text();
        text = text.replace('Hymn #', '');
        text.replace(' (second tune)', 's');
        text.replace(' (third tune)', 't');
        text.replace(' (fourth tune)', 'f');

        var num = Enumerable.From(arrNums)
						.Where(function (x) { return x.Num == text })
						.Select(function (x) { return x; }).ToArray()[0].Num;
        hymn.text(num);
        getLyrics(hymn.text());
        goToHymn();
    });

    if (num.indexOf('s') > 0)
        num = num.replace('s', ' (second tune)');
    else if (num.indexOf('t') > 0)
        num = num.replace('t', ' (third tune)');
    else if (num.indexOf('f') > 0)
        num = num.replace('f', ' (fourth tune)');
    title.html('Hymn #' + num);

    var line = $('<p></p>');
    line.addClass('list-group-item-text');
    line.text(lineText);

    var content = $('<div></div>');
    content.addClass('row-content');
    content.append(title);
    content.append(line);

    var now = new Date();

    var year = now.getYear();
    var month = now.getMonth();
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    a.append(divPrimary);
    a.append(content);

    $('#history').append(a);
}

function removeHistory() {
    $('#history > a:first').remove();
}

function addBookmark(number) {
    var a = $('<a></a>');
    a.addClass('list-group-item');
    a.addClass('rippler');
    a.addClass('rippler-inverse');

    var icon = $('<i></i>');
    icon.addClass('mdi-action-bookmark');

    var divPrimary = $('<div></div>');
    divPrimary.addClass('row-action-primary');
    divPrimary.append(icon);

    var title = $('<h4></h4>');
    title.addClass('list-group-item-heading');
    num = number.replace('.mbk', '');
    var lineText = Enumerable.From(arrNums)
						.Where(function (x) { return x.Num == num })
						.Select(function (x) { return x; }).ToArray()[0].FirstLine;
    a.click(function () {
        var text = $(this).children('div.row-content').children('h4').text();
        text = text.replace('Hymn #', '');
        text.replace(' (second tune)', 's');
        text.replace(' (third tune)', 't');
        text.replace(' (fourth tune)', 'f');

        num = Enumerable.From(arrNums)
						.Where(function (x) { return x.Num == text })
						.Select(function (x) { return x; }).ToArray()[0].Num;
        hymn.text(num);
        getLyrics(hymn.text());
        goToHymn();
    });

    var hTitle;
    if (num.indexOf('s') > 0)
        hTitle = num.replace('s', ' (second tune)');
    else if (num.indexOf('t') > 0)
        hTitle = num.replace('t', ' (third tune)');
    else if (num.indexOf('f') > 0)
        hTitle = num.replace('f', ' (fourth tune)');
    else
        hTitle = num;
    title.html('Hymn #' + hTitle);

    var line = $('<p></p>');
    line.addClass('list-group-item-text');
    line.text(lineText);

    var content = $('<div></div>');
    content.addClass('row-content');
    content.append(title);
    content.append(line);

    a.append(divPrimary);
    a.append(content);

    $('#bookmarks').append(a);
}

function themeLightDark(val) {
    theme = val;
    switch (theme) {
        case 'dark':
            if (!$(document.body).hasClass('inverse'))
                $(document.body).addClass('inverse');
            $('.list-group-item').toggleClass('rippler-default rippler-inverse');
            break;
        case 'light':
            if ($(document.body).hasClass('inverse')) {
                $(document.body).removeClass('inverse');
                $('.list-group-item, .nav-pills li a').toggleClass('rippler-default rippler-inverse');
            }
    }
    settings.theme = theme;
}

function createToast(message) {
    Toast.init();
    Toast({
        time: 2000,
        type: 'normal',
        autoPos: true,
        text: message
    }).show();
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

function toggleCollapse() {
    $('.side-collapse').toggleClass('in');
    if ($('.side-collapse').hasClass('in'))
        $('.black-overlay').css('display', 'block');
    else
        $('.black-overlay').css('display', 'none');
}

function loadSettings() {
    window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
        dirEntry.getFile(settingsPath, { create: true }, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    var text = evt.target.result;
                    if (text != undefined && text.trim() != "") {
                        settings = JSON.parse(text);
                    }
                };
                reader.readAsText(file);
            }, function (error) {
                console.log(error.code);
            });

        }, function (error) {
            console.log(error.code);
        });
    });
}

function saveSettings() {
    window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
        dirEntry.getFile(settingsPath, { create: false }, function (fileEntry) {
            fileEntry.remove(function () {
                dirEntry.getFile(settingsPath, { create: true }, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        var jsonString = JSON.stringify(settings);
                        try {
                            writer.write(jsonString);
                            writer.onwrite = function (a) {
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }, function (error) {
                        console.log(error.code);
                    });

                }, function (error) {
                    console.log(error.code);
                });
            });
        });
    }, function (error) {
        console.log(error.code);
    });
}

function saveHistory() {
    window.resolveLocalFileSystemURL(storagePath, function (dirEntry) {
        dirEntry.getFile(historyPath, { create: false }, function (fileEntry) {
            fileEntry.remove(function () {
                dirEntry.getFile(historyPath, { create: true }, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        var jsonString = JSON.stringify(hist);
                        try {
                            writer.write(jsonString);
                            writer.onwrite = function (a) {

                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }, function (error) {
                        console.log(error.code);
                    });

                }, function (error) {
                    console.log(error.code);
                });
            });
        });
    }, function (error) {
        console.log(error.code);
    });
}