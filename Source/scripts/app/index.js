function ShellViewModel() {
    var self = this;

    //Properties
    self.breadcrumbs = ko.observableArray([]);
    self.LoginVisible = ko.observable(true);
    self.RegisterVisible = ko.observable(true);
    self.LogoutVisible = ko.observable(false);
    self.AppName = ko.observable(App.gui.App.manifest.name);
    self.AppVersion = ko.observable(App.gui.App.manifest.version);
    self.projectName = ko.observable("");

    //Functions
    self.init = function () {
        App.Init();

        //App.gui.Window.get().maximize();
        
        //Init page manager
        App.PageManager.Init();
    }
    self.LoadBreadCrumbs = function () {
        self.breadcrumbs([]);
        var page = $.grep(App.Variables.BaseViews, function (item) {
            return item.key == App.Variables.ActivePage;
        });

        if (page[0] != undefined && page[0].breadcrumbs != undefined && page[0].breadcrumbs.length > 0) {
            $(page[0].breadcrumbs).each(function (index, crumb) {
                var crumbpage = $.grep(App.Variables.BaseViews, function (item) {
                    return item.key == crumb;
                });

                var title = crumbpage[0].title;
                var key = (crumbpage[0].key == App.Variables.ActivePage) ? "" : crumbpage[0].key;

                self.breadcrumbs.push({ title: title, key: key });
            });
        }

        //Load Active Project
        if (App.Variables.ActiveProjectID != "") {
            App.Projects.FindByID(App.Variables.ActiveProjectID).then(function (project) {
                if (!$.isEmptyObject(project)) {
                    self.projectName(project.projectName);
                }
            });
        }
        else
        {
            self.projectName("");
        }
    }

    //Events
    self.MenuClick = function (data, event) {
        $("#wrapper").toggleClass("toggled");
    }
    self.KooBooLinkClick = function (data, event) {
        App.gui.Shell.openExternal('http://www.kooboo.co.za');
    }
    self.RegisterClick = function (data, event) {
        App.PageManager.LoadPage('account_register');
    }
    self.LoginClick = function (data, event) {
        App.PageManager.LoadPage('account_login');
    }
    self.LogoutClick = function (data, event) {
        App.Authentication.LogOut();
    }
    self.CrumbClick = function (data, event) {
        if (data.key != "") {
            App.PageManager.LoadPage(data.key);
        }
    }

    //Load View Model
    self.init();
}

App.Variables.shellViewModel = new ShellViewModel();

ko.applyBindings(App.Variables.shellViewModel, document.getElementById("shell"));
ko.applyBindings(App.Variables.shellViewModel, document.getElementById("footer"));
ko.applyBindings(App.Variables.shellViewModel, document.getElementById("breadcrumbs"));