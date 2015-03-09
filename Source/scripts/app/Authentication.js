App.Authentication = (function () {
    return{
        VerifyLogin: _VerifyLogin,
        LogOut: _LogOut
    }

    function _VerifyLogin(username, password, rememberMe)
    {
        var deferred = App.Q.defer();
        
        //Verify the username and password
        if (username == "test@test.com" && password == "vXING2vO14XmduVEHRN0T8+HeL/rXhYxV2sxk3GB56s=") //TODO: Implement live authentication
        {
            App.Variables.IsAuthorized = true;

            if (rememberMe)
            {
                //Update username password remember setting
                App.Settings.FindByKey("UsernamePassword").then(function (setting) {
                    var id = "";
                    if(!$.isEmptyObject(setting) && setting != null)
                    {
                        id = setting._id;
                    }

                    App.Settings.InsertUpdate(id, "UsernamePassword", { Ussername: username, Password: password });
                });
            }

            deferred.resolve(true);
        }
        else
        {
            deferred.resolve(false);
        }

        return deferred.promise;
    }

    function _LogOut()
    {
        //clear login cache on logout
        App.Settings.FindByKey("UsernamePassword").then(function (setting) {
            App.Settings.Delete(setting._id);
        });

        //Set nav bar
        App.Variables.shellViewModel.RegisterVisible(true);
        App.Variables.shellViewModel.LoginVisible(true);
        App.Variables.shellViewModel.LogoutVisible(false);
        App.Variables.IsAuthorized = false;
        App.PageManager.LoadPage("home", true);
    }
})();