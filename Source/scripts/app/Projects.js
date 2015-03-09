App.Projects = (function () {
    return {
        FindAll: _FindAll,
        FindAllDesc: _FindAllDesc,
        FindRecent: _FindRecent,
        FindByID: _FindByID,
        InsertUpdate: _InsertUpdate,
        Delete: _Delete
    }

    function _FindRecent()
    {
        var deferred = App.Q.defer();

        App.projectDB.find({}).sort({ dateAdded: -1 }).limit(5).exec(function (err, docs) {
            deferred.resolve(docs);
        });

        return deferred.promise;
    }

    function _FindAll()
    {
        var deferred = App.Q.defer();

        App.projectDB.find({}).sort({ dateAdded: 1 }).exec(function (err, docs) {
            deferred.resolve(docs);
        });

        return deferred.promise;
    }

    function _FindAllDesc() {
        var deferred = App.Q.defer();

        App.projectDB.find({}).sort({ dateAdded: -1 }).exec(function (err, docs) {
            deferred.resolve(docs);
        });

        return deferred.promise;
    }

    function _FindByID(id)
    {
        var deferred = App.Q.defer();

        App.projectDB.findOne({ _id: id }, function (err, doc) {
            deferred.resolve(doc);
        });

        return deferred.promise;
    }

    function _InsertUpdate(id, projectName, targetUrl, proxyPort, dualModeProxy)
    {
        var deferred = App.Q.defer();

        _FindByID(id).then(function (project) {
        
            //check insert
            if (id == "" || $.isEmptyObject(project) || project == null || project == undefined) {
                project = {
                    projectName: projectName,
                    targetUrl: targetUrl,
                    proxyPort: proxyPort,
                    dateAdded: new Date(),
                    dualModeProxy: dualModeProxy
                }

                App.projectDB.insert(project, function (err, newDoc) {
                    deferred.resolve(newDoc._id);
                });
            }
            else //Update
            {
                project.projectName = projectName;
                project.targetUrl = targetUrl;
                project.proxyPort = proxyPort;
                project.dualModeProxy = dualModeProxy

                App.projectDB.update({ _id: id }, project, {}, function (err, numReplaced) {
                    deferred.resolve(id);
                });
            }
        });

        return deferred.promise;
    }

    function _Delete(id)
    {
        var deferred = App.Q.defer();

        App.projectDB.remove({ _id: id }, {}, function (err, numRemoved) {
            deferred.resolve(true);
        });

        return deferred.promise;
    }
    
})();