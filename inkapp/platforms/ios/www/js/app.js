// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('ink', ['ionic', 'ink.controllers', 'ink.services', 'ink.directives'])

    .run(function ($ionicPlatform, $rootScope) {
        $rootScope.destination = 'http://192.168.1.73:2118/';
        $rootScope.pageIndices = {homePage: 0, loginPage: 1};
        $ionicPlatform.ready(function () {
            console.log("STARTING THE APP");

            if (!window.cordova) {
                facebookConnectPlugin.browserInit("331871496967792");
                // version is optional. It refers to the version of API you may want to use.
            }

            console.log("Didn't bother with the facebook plugin CAUSE WE'RE CORDOVA");

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            console.log("Did that window shit");

            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            console.log("Set up the status bar bitch");

        });
    })


.config(function ($stateProvider, $urlRouterProvider) {

        console.log("Setting up the state provider");

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                controller: 'MasterCtrl'
            })

            // Each tab has its own nav history stack:

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.artist-detail', {
                url: '/artist/:artistID',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/artist-detail.html',
                        controller: 'ArtistDetailCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    });

