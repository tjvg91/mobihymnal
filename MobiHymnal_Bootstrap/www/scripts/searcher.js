this.onmessage = function (e) {
    for (var i = 1; i <= 793; i++) {
        this.postMessage(i);
        var rawFile;
        if (typeof XMLHttpRequest !== 'undefined') rawFile = new XMLHttpRequest();
        else {
            var versions = ["MSXML2.XmlHttp.5.0",
                    "MSXML2.XmlHttp.4.0",
                    "MSXML2.XmlHttp.3.0",
                    "MSXML2.XmlHttp.2.0",
                    "Microsoft.XmlHttp"]

            for (var i = 0, len = versions.length; i < len; i++) {
                try {
                    rawFile = new ActiveXObject(versions[i]);
                    break;
                }
                catch (e) { }
            } // end for
        }
        rawFile.open("GET", "../texts/h" + i + ".html", true);
        
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    console.log('go');
                    var allText = rawFile.responseText;
                }
            }
        }
        rawFile.send('');

        //$.get("texts/h" + i + ".html", function (returnedData) {
        //    var text = returnedData;
        //    console.log('sulud');
        //    if (text.indexOf(e.data) > 1)
        //    {
        //        var lines = text.split('<br/>');
        //        for(var j = 0; j < lines.length; j++)
        //        {
        //            if (lines[j].indexOf(e.data))
        //            {
        //                this.postMessage({ 'num': i, 'line': lines[j] });
        //                break;
        //            }
        //        }
        //    }
        //}, "text/plain");
    }
    this.postMessage('DONE');
}
