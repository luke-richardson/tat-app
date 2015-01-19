angular.module('ink.services', [])

    .factory('socket', function ($rootScope) {
        console.log("about to connect insecurely");
        var socket = io.connect($rootScope.destination);

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                console.log("Making a function call to " + eventName);
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            console.log("Callback being logged for " + eventName);
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        }
    })

    .factory('secureSocket', function ($rootScope) {

        var socket = null;

        var connect = function () {
            if (localStorage.getItem("token") !== null) {
                socket = io.connect($rootScope.destination + 'sio').on('connect', function () {
                    socket.on('authenticated', function () {
                    }).emit('authenticate', {token: localStorage.getItem("token")}).on('authenticated', function () {
                    });
                });
            }
        }

        return {
            on: function (eventName, callback) {
                if (socket === null) connect();
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                if (socket === null) connect();
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        }
    })

    .factory('QueryTats', function (socket, $ionicPopup) {
        var factory = {};

        factory.execute = function (minDistance, callback) {
            console.log("ABOUT TO QUERY LOCATION");
            navigator.geolocation.getCurrentPosition(function (position) {
                console.log("UR LOCATION GOT WELL QUERIED BRUV");
                //success
                socket.emit('getArtworksByDistance', {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                    minDistanceMetres: minDistance
                }, callback);
            }, function (err) {
                //failure
                $ionicPopup.confirm({
                    title: 'This app requires GPS',
                    template: 'Please try again.'
                }).then(function () {
                    navigator.app.exitApp();
                })
            }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
        };

        factory.getTatsByArtistID = function (artistID, callback) {
            socket.emit('getArtworksByArtist', artistID, callback);
        }

        return factory;
    })

    .factory('QueryArtistById', function (socket) {
        var factory = {};

        factory.execute = function (artistID, callback) {
            socket.emit('getUser', artistID, callback);
        };

        return factory;
    })

    .factory('LoginService', function ($ionicPopup, $ionicTabsDelegate, socket, secureSocket, $rootScope) {
        var lgn = {};

        var serverAuth = function (suc) {
            facebookConnectPlugin.getAccessToken(function (token) {
                socket.emit("authenticate", token, function (profile, token) {
                    localStorage.setItem("token", token);
                    sessionStorage.setItem("myProfile", angular.toJson(profile));
                    suc(profile);
                })
            }, function (err) {
                failPopup();
            });
        }


        // A confirm dialog

        var failPopup = function () {
            $ionicPopup.confirm({
                title: 'UNSUCCESSFUL LOGIN',
                template: 'Please try again.'
            }).then(function () {
                $ionicTabsDelegate.select($rootScope.pageIndices.homePage, true);
            });
        }

        var fbLogin = function (suc) {
            facebookConnectPlugin.login(["public_profile", "email"], function (dat) {
                serverAuth(suc);
            }, function () {
                failPopup();
            });
        }

        lgn.showLogin = function (suc) {
            console.log("Show login invoked");
            $ionicPopup.confirm({
                title: 'Anonymous user',
                template: 'Please log in with Facebook'
            }).then(function (res) {
                if (res) {
                    fbLogin(suc);
                } else {
                    $ionicTabsDelegate.select($rootScope.pageIndices.homePage, true);
                }
            });
        };


        lgn.checkLoggedIn = function (successCallback, failureCallback) {

            facebookConnectPlugin.getLoginStatus(function (sObj) {
                console.log("Connected in facebook thingie")
                if (sObj.status === 'connected') {
                    console.log("Facebook is connected");
                    var tkn = localStorage.getItem("token");
                    console.log("Token is: " + tkn);
                    var storedProf = sessionStorage.getItem("myProfile");
                    console.log("profile is: " + storedProf);
                    if (tkn === null) {
                        serverAuth(successCallback);
                    } else {
                        if(storedProf){
                            successCallback(angular.fromJson(storedProf));
                        }else{
                            secureSocket.emit('myProfile', {}, function (data) {
                                if (data !== null && data.err === undefined) {
                                    sessionStorage.setItem("myProfile", angular.toJson(data));
                                    successCallback(data);
                                } else {
                                    failPopup();
                                }
                            });
                        }
                    }
                } else {
                    console.log("Facebook is not connected");
                    failureCallback();
                }

            }, function () {
                failureCallback();
            });
        }

        lgn.logOut = function () {
            console.log("Logging out");
            localStorage.removeItem("token");
            console.log("Token now: " + localStorage.getItem("token"));
            sessionStorage.removeItem("myProfile");
            console.log("Profile now: " + sessionStorage.getItem("myProfile"));
            facebookConnectPlugin.logout(function () {
                //Success
                console.log("Successfully logged out.");
            }, function () {
                //Failure
                console.log("Unsuccessful log out.");
            });
            $ionicTabsDelegate.select($rootScope.pageIndices.homePage, true);
        }
        return lgn;

    });
