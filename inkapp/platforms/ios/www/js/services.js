angular.module('ink.services', [])

    .factory('socket', function ($rootScope) {
        var socket = io($rootScope.destination);

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

    .factory('secureSocket', function ($rootScope) {

        var socket = io.connect($rootScope.destination + 'sio').on('connect', function () {
            socket.on('authenticated', function () {
                }).emit('authenticate', {token: localStorage.getItem("token")}).on('authenticated', function(){
            });
        });

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

    .factory('cacheMaster', function (socket) {
        return {
            callOrCacheSession: function (args, socketF, callback) {
                var sArgs = socketF + angular.toJson(args);
                if (sessionStorage.getItem(sArgs) !== null) {
                    callback(angular.fromJson(sessionStorage.getItem(sArgs)));
                } else {
                    var wrappedCallback = function (data) {
                        sessionStorage.setItem(sArgs, angular.toJson(data));
                        callback(data);
                    }
                    socket.emit(socketF, args, wrappedCallback);
                }

            },
            callOrCacheLocal: function (args, socketF, callback) {
                var sArgs = angular.toJson(args);
                if (localStorage.getItem(sArgs) !== null) {
                    callback(angular.fromJson(localStorage.getItem(sArgs)));
                } else {
                    var wrappedCallback = function (data) {
                        localStorage.setItem(sArgs, angular.toJson(data));
                        callback(data);
                    }
                    socket.emit(socketF, args, wrappedCallback);
                }

            }
        }
    })

    .factory('QueryTats', function (socket, cacheMaster) {
        var factory = {};

        factory.execute = function (callback) {
            cacheMaster.callOrCacheSession('dashContents', 'getArtworks', callback);
        };

        factory.getTatsByArtistName = function (artistName, callback) {
            socket.emit('getArtworksByArtist', artistName, callback);
        }

        return factory;
    })

    .factory('QueryArtistById', function (socket, cacheMaster) {
        var factory = {};

        factory.execute = function (artistName, callback) {
            cacheMaster.callOrCacheSession(artistName, 'getUser', callback);
        };

        return factory;
    })

    .factory('LoginService', function ($rootScope, $ionicPopup, $ionicTabsDelegate, socket, secureSocket) {
        var lgn = {};
        var lgnScope = $rootScope.$new();

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
                    var profile = angular.fromJson(sessionStorage.getItem("myProfile"));
                    if(profile === null){
                        var tkn = localStorage.getItem("token");
                        if(tkn === null){
                            serverAuth(successCallback);
                        }else{
                            secureSocket.emit('myProfile', {}, function(data){
                                if(data !== null && data.err === undefined){
                                    sessionStorage.setItem("myProfile", angular.toJson(data));
                                    successCallback(data);
                                }else{
                                    failPopup();
                                }
                            });
                        }
                    } else {
                        successCallback(profile);
                    }
                } else {
                    failureCallback();
                    showLogin();
                }

            }, function () {
                failureCallback();
                showLogin();
            });
        }

        return lgn;

    });
