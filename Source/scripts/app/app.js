﻿var App = App || {};
App.gui = require('nw.gui');
App.Q = require('q');
App.path = require('path');
App.fileSystem = require('fs');
App.Crypto = require("crypto-js");
App.moment = require('moment');
App.Datastore = require('nedb');
App.express = require("express");
App.http = require("http");
App.bodyParser = require('body-parser');
App.cluster = require('cluster');
App.lodash = require('lodash');

//App Methods
App.Init = function()
{
    App.SetupMenuBar();
    App.projectDB = new App.Datastore(
        {
            filename: (App.Constants.BaseDBPath + 'projects.db'),
            autoload: true
            //afterSerialization: App.EncryptDB,
            //beforeDeserialization: App.DecryptDB
        });
    App.projectEndpontsDB = new App.Datastore(
        {
            filename: (App.Constants.BaseDBPath + 'projectEndpoints.db'),
            autoload: true
            //afterSerialization: App.EncryptDB,
            //beforeDeserialization: App.DecryptDB
        });
}
App.NavigateHome = function()
{
    App.Variables.ActiveProjectID = "";
    App.PageManager.LoadPage("home");
}
App.GetFileExtention = function(filename)
{
    var ext = filename.split('.').pop();
    if(ext == filename) return "";
    return ext;
}
App.GetRandomNumber = function () {
    return Math.floor(Math.random() * 999) + 1;
}
App.EncryptDB = function (strData) {
    if (strData != undefined && strData != "") {
        var encrypted = App.Crypto.AES.encrypt(strData, App.Constants.DBKey);
        var ciphertext = encrypted.toString();

        return ciphertext;
    }
    else {
        return strData;
    }
}
App.DecryptDB = function (strData) {
    if (strData != undefined && strData != "") {
        var decrypted = App.Crypto.AES.decrypt(strData, App.Constants.DBKey);
        var plaintext = decrypted.toString(App.Crypto.enc.Utf8);

        return plaintext;
    }
    else {
        return strData;
    }
}
App.GetNewLineChar = function () {
    var newline = String.fromCharCode(13, 10);
    return newline;
}
App.SetupMenuBar = function () {
    // initialize window menu
    var win = App.gui.Window.get(),
        nativeMenuBar = new App.gui.Menu({
            type: "menubar"
        });

    // check operating system for the menu
    if (process.platform === "darwin") {
        nativeMenuBar.createMacBuiltin("Mock-KingBird");
    }

    // actually assign menu to window
    win.menu = nativeMenuBar;
}