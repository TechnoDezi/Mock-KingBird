
App.Constants = (function() {
    return {
        BasePlaceholderID: "pageHolder",
        BaseMenuPlaceholderID: "menuHolder",
        HashingKey: "g7&KP9D%@g$d34D2(sD4",
        DBKey: "g7&K3^9D%@47$d34D2(sD4@#Ds8G3K%s",
        BaseImagePath: App.path.join(App.gui.App.dataPath, 'Images/'),
        BaseDBPath: App.path.join(App.gui.App.dataPath, 'neDB/')
    }
})();

App.Variables = (function () {
    return {
        BaseViews: [],
        IsAuthorized: false,
        ActiveProjectID: "",
        shellViewModel: null,
        activePageViewModel: null,
        ActivePage: "home"
    }
})();