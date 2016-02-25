(function () {
    "use strict";

    angular.module("myapp", ["ionic", "myapp.controllers", "myapp.services"])
        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
            .state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "app/templates/view-menu.html",
                controller: "appCtrl"
            })
            .state("app.home", {
                url: "/home",
                templateUrl: "app/templates/view-home.html",
                controller: "homeCtrl"
            })
            .state("app.input", {
                url: "/input",
                templateUrl: "app/templates/view-input.html",
                controller: "inputCtrl"
            })
            .state("app.search", {
                url: "/search",
                templateUrl: "app/templates/view-search.html",
                controller: "searchCtrl"
            })
            .state("app.settings", {
                url: "/settings",
                templateUrl: "app/templates/view-settings.html",
                controller: "settingsCtrl"
            })
            .state("app.bookmarks", {
                url: "/bookmarks",
                templateUrl: "app/templates/view-bookmarks.html",
                controller: "bookmarksCtrl"
            });
            $urlRouterProvider.otherwise("/app/home");
        });
})();