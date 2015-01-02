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

    .factory('LoginService', function ($ionicPopup, $ionicTabsDelegate, socket, secureSocket) {
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
                $ionicTabsDelegate.select(0, true);
            });
        }

        var fbLogin = function (suc) {
            facebookConnectPlugin.login(["public_profile", "email"], function (dat) {
                serverAuth(suc);
            }, function () {
                failPopup();
            });
        }

        var showLogin = function (suc) {
            $ionicPopup.confirm({
                title: 'Anonymous user',
                template: 'Please log in with Facebook'
            }).then(function (res) {
                if (res) {
                    fbLogin(suc);
                } else {
                    $ionicTabsDelegate.select(0, true);
                }
            });
        };

        lgn.checkLoggedIn = function (successCallback, failureCallback) {

            facebookConnectPlugin.getLoginStatus(function (sObj) {
                if (sObj.status === 'connected') {
                    var tkn = localStorage.getItem("token");
                    if (tkn === null) {
                        serverAuth(successCallback);
                    } else {
                        secureSocket.emit('myProfile', {}, function (data) {
                            if (data !== null && data.err === undefined) {
                                sessionStorage.setItem("myProfile", angular.toJson(data));
                                successCallback(data);
                            } else {
                                failPopup();
                            }
                        });
                    }
                } else {
                    failureCallback();
                    showLogin(successCallback);
                }

            }, function () {
                failureCallback();
                showLogin(successCallback);
            });
        }

        lgn.logOut = function () {
            localStorage.removeItem("token");
            sessionStorage.removeItem("myProfile")
            facebookConnectPlugin.logout(function () {
                //Success
                console.log("Successfully logged out.");
            }, function () {
                //Failure
                console.log("Unsuccessful log out.");
            });
            $ionicTabsDelegate.select(0, true);
        }
        return lgn;

    });
