App.ProjectEndpoints = (function () {
    return {
        InsertUpdate: _InsertUpdate,
        FindByID: _FindByID,
        FindBySignature: _FindBySignature,
        Delete: _Delete,
        FindAll: _FindAll
    }

    function _FindByID(id) {
        var deferred = App.Q.defer();

        App.projectEndpontsDB.findOne({ _id: id }, function (err, doc) {
            deferred.resolve(doc);
        });

        return deferred.promise;
    }

    function _FindAll(projectID) {
        var deferred = App.Q.defer();

        App.projectEndpontsDB.find({ projectID: projectID }).exec(function (err, docs) {
            deferred.resolve(docs);
        });

        return deferred.promise;
    }

    function _FindBySignature(projectID, url, method, reqData) {
        var deferred = App.Q.defer();

        var objectToMatch = {
            url: url,
            method: method,
            reqData: reqData
        }

        App.projectEndpontsDB.find({ projectID: projectID }, function (err, docs) {

            var docFound = App.lodash.find(docs, function (doc) {
                var objectMustMatch = {
                    url: doc.url,
                    method: doc.method,
                    reqData: doc.reqData
                }

                return App.lodash.isEqual(objectToMatch, objectMustMatch);
            });

            deferred.resolve(docFound);
        });

        return deferred.promise;
    }

    function _InsertUpdate(id, projectID, url, method, reqHeaders, reqData, respHeaders, respData, isLocked)
    {
        var deferred = App.Q.defer();
        
        if (id == undefined || id == null || id == "") {
            _FindBySignature(projectID, url, method, reqData).then(function (project) {
                
                //check insert
                if ($.isEmptyObject(project) || project == null || project == undefined) {
                    project = {
                        projectID: projectID,
                        url: url,
                        method: method,
                        reqHeaders: reqHeaders,
                        reqData: reqData,
                        respHeaders: respHeaders,
                        respData: respData,
                        isLocked: isLocked
                    }

                    App.projectEndpontsDB.insert(project, function (err, newDoc) {
                        deferred.resolve(newDoc._id);
                    });
                }
                else if (project.isLocked == undefined || project.isLocked == null || project.isLocked == false) //Update
                {
                    project.projectID = projectID;
                    project.url = url;
                    project.method = method;
                    project.reqHeaders = reqHeaders;
                    project.reqData = reqData;
                    project.respHeaders = respHeaders;
                    project.respData = respData;
                    project.isLocked = isLocked;

                    App.projectEndpontsDB.update({ _id: project._id }, project, {}, function (err, numReplaced) {
                        deferred.resolve(project._id);
                    });
                }
            });
        }
        else if (id != "")
        {
            _FindByID(id).then(function (project) {

                //check update
                if (!$.isEmptyObject(project) && project != null && project != undefined) {
                    project.projectID = projectID;
                    project.url = url;
                    project.method = method;
                    project.reqHeaders = reqHeaders;
                    project.reqData = reqData;
                    project.respHeaders = respHeaders;
                    project.respData = respData;
                    project.isLocked = isLocked;

                    App.projectEndpontsDB.update({ _id: project._id }, project, {}, function (err, numReplaced) {
                        deferred.resolve(project._id);
                    });
                }
            });
        }

        return deferred.promise;
    }

    function _Delete(id)
    {
        var deferred = App.Q.defer();

        App.projectEndpontsDB.remove({ _id: id }, {}, function (err, numRemoved) {
            deferred.resolve(true);
        });

        return deferred.promise;
    }
    
})();