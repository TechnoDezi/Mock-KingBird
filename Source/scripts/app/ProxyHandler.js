App.ProxyHandler = (function () {
    return {
        StartProxyServer: _StartProxyServer,
        StopProxyServer: _StopProxyServer
    }

    var logText = "";
    var server = {};

    function _StartProxyServer(proxyPort, projectObj, isRecording, isPlayback, logUpdateCallback)
    {
        logText = "";

        var exp = App.express();
        exp.use(App.bodyParser.json());

        exp.all("*", function (request, response, next) {
            _logRequest(request, logUpdateCallback, proxyPort);

            _ProxyApiCall(request, isRecording, isPlayback, function (headerObj, status, bodyString) {
                //Write headers
                $.each(headerObj, function (key, value) {
                    response.setHeader(key, value);
                });
                response.writeHead(status);
                response.end(bodyString);
            }, logUpdateCallback, projectObj);
        });

        server = App.http.createServer(exp).listen(proxyPort);

        _logProxyStarted(proxyPort, logUpdateCallback, isPlayback, projectObj.dualModeProxy);
    }

    function _buildResponseHeaderObject(headers)
    {
        var headerObj = {};
        var headersList = headers.split("\r\n");

        //Add headers to object
        $.each(headersList, function (key, value) {
            var objValColPos = value.indexOf(":");
            var objKey = value.substring(0, objValColPos);
            var objValue = value.replace(objKey + ": ", "");

            if (objKey != "" && objValue != "" && objKey.toLowerCase() != "accept-encoding"
                && objKey.toLowerCase() != "connection" && objKey.toLowerCase() != "user-agent"
                && objKey.toLowerCase() != "host" && objKey.toLowerCase() != "content-length"
                && objKey.toLowerCase() != "content-encoding" && objKey.toLowerCase() != "content-language"
                && objKey.toLowerCase() != "transfer-encoding" && objKey.toLowerCase() != "x-archived-client-ip"
                && objKey.toLowerCase() != "x-client-ip") {
                headerObj[objKey] = objValue;
            }
        });

        return headerObj;
    }

    function _ProxyApiCall(request, isRecording, isPlayback, callback, logUpdateCallback, projectObj)
    {
        if (isRecording) {
            _ProxyRecording(request, callback, logUpdateCallback, projectObj);
        }
        else if (isPlayback)
        {
            _ProxyPlayback(request, callback, logUpdateCallback, projectObj);
        }
    }

    function _ProxyPlayback(request, callback, logUpdateCallback, projectObj) {

        //Lookup proxy response based on signature
        App.ProjectEndpoints.FindBySignature(App.Variables.ActiveProjectID, request.url, request.method, request.body).then(function (doc) {
            if (!$.isEmptyObject(doc) && doc != undefined && doc != null) {
                _logProxyPlaybackUrl(doc.url, projectObj, logUpdateCallback);

                var headerObj = doc.respHeaders;
                var body = (doc.respData != undefined && doc.respData != null && doc.respData != "") ? doc.respData : "";
                var bodyString = JSON.stringify(body);

                //Log
                _logResponseHeaders(headerObj, logUpdateCallback);
                _logResponseBody(body, logUpdateCallback);

                logText += "------------------------------------------------------" + App.GetNewLineChar();
                logUpdateCallback(logText);

                callback(headerObj, 200, bodyString);
            }
            else if (projectObj.dualModeProxy)
            {
                _ProxyRecording(request, callback, logUpdateCallback, projectObj);
            }
            else {
                logText += "No response endpoint found for " + request.url + App.GetNewLineChar();
                logText += "------------------------------------------------------" + App.GetNewLineChar();
                logUpdateCallback(logText);
            }
        });
    }

    function _ProxyRecording(request, callback, logUpdateCallback, projectObj)
    {
        _logProxyUrl(request.url, projectObj, logUpdateCallback);

        $.ajaxSetup({ cache: false });
        var req = $.ajax({
            type: request.method,
            url: projectObj.targetUrl + request.url,
            data: JSON.stringify(request.body),
            headers: request.headers,
            complete: function (data) {
                try {
                    var headerObj = _buildResponseHeaderObject(req.getAllResponseHeaders());
                    var body = data.responseJSON;
                    var bodyString = JSON.stringify(body);

                    //Log
                    _logResponseHeaders(headerObj, logUpdateCallback);
                    _logResponseBody(body, logUpdateCallback);

                    //Record request in DB
                    App.ProjectEndpoints.InsertUpdate("", App.Variables.ActiveProjectID, request.url, request.method, request.headers,
                        request.body, headerObj, body, false).then(function (id) {

                            logText += "Request Recorded ID: " + id + App.GetNewLineChar();
                            logText += "------------------------------------------------------" + App.GetNewLineChar();
                            logUpdateCallback(logText);

                            callback(headerObj, data.status, bodyString);
                        });
                }
                catch (ex) {
                    _logError(ex.message, logUpdateCallback);
                }
            },
            error: function (request, textStatus, errorThrown) {
                _logError(JSON.stringify(errorThrown), logUpdateCallback);
            }
        });
    }

    function _StopProxyServer(logUpdateCallback)
    {
        try {
            server.close();
        } catch (ex) { }

        logText += "Proxy server stopped" + App.GetNewLineChar();
        logText += "------------------------------------------------------" + App.GetNewLineChar();
        logUpdateCallback(logText);
    }

    //------------------Logging-----------------------------------
    function _logRequest(request, logUpdateCallback, proxyPort) {
        logText += "Proxy request on http://localhost:" + proxyPort + request.url + App.GetNewLineChar();
        logText += "Method: " + request.method + App.GetNewLineChar();

        $.each(request.headers, function (key, header) {
            logText += key + ": " + header + App.GetNewLineChar();
        });

        logText += "Body Content :" + JSON.stringify(request.body) + App.GetNewLineChar();

        logText += "------------------------------------------------------" + App.GetNewLineChar();

        logUpdateCallback(logText);
    }

    function _logProxyStarted(proxyPort, logUpdateCallback, isPlayback, isDualModeProxy) {
        if (isPlayback && !isDualModeProxy) {
            logText += "Running Proxy Playback on http://localhost:" + proxyPort + "/" + App.GetNewLineChar();
        }
        else if (isPlayback && isDualModeProxy)
        {
            logText += "Running Dual Playback/Proxy on http://localhost:" + proxyPort + "/" + App.GetNewLineChar();
        }
        else {
            logText += "Running Proxy on http://localhost:" + proxyPort + "/" + App.GetNewLineChar();
        }
        logText += "------------------------------------------------------" + App.GetNewLineChar();
        logUpdateCallback(logText);
    }

    function _logProxyUrl(url, projectObj, logUpdateCallback) {
        logText += "Proxy to " + projectObj.targetUrl + url + App.GetNewLineChar();
        logUpdateCallback(logText);
    }

    function _logProxyPlaybackUrl(url, projectObj, logUpdateCallback) {
        logText += "Found Response for endpoint: " + url + App.GetNewLineChar();
        logUpdateCallback(logText);
    }

    function _logResponseHeaders(headers, logUpdateCallback) {
        $.each(headers, function (key, header) {
            logText += key + ": " + header + App.GetNewLineChar();
        });
        logUpdateCallback(logText);
    }

    function _logResponseBody(body, logUpdateCallback) {
        logText += "Body Content :" + JSON.stringify(body) + App.GetNewLineChar();
        logUpdateCallback(logText);
    }

    function _logError(errorMessage, logUpdateCallback) {
        logText += "Proxy Error Occurred: " + errorMessage + App.GetNewLineChar();
        logText += "------------------------------------------------------" + App.GetNewLineChar();
        logUpdateCallback(logText);
    }
})();