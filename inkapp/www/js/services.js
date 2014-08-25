angular.module('ink.services', [])

    .factory('socket', function ($rootScope) {
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
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        }})

    .factory('cacheMaster', function(socket) {
        return {
            callOrCacheSession: function(args, socketF, callback){
                var sArgs = socketF + angular.toJson(args);
                if(sessionStorage.getItem(sArgs) !== null){
                    callback(angular.fromJson(sessionStorage.getItem(sArgs)));
                }else{
                    var wrappedCallback = function(data){
                        sessionStorage.setItem(sArgs, angular.toJson(data));
                        callback(data);
                    }
                    socket.emit(socketF, args,  wrappedCallback);
                }

            },
            callOrCacheLocal: function(args, socketF, callback){
                var sArgs = angular.toJson(args);
                if(localStorage.getItem(sArgs) !== null){
                    callback(angular.fromJson(localStorage.getItem(sArgs)));
                }else{
                    var wrappedCallback = function(data){
                        localStorage.setItem(sArgs, angular.toJson(data));
                        callback(data);
                    }
                    socket.emit(socketF, args,  wrappedCallback);
                }

            }
        }
    })

    .factory('QueryTats', function (socket, cacheMaster) {
        var factory = {};

        factory.execute = function (callback) {
            cacheMaster.callOrCacheLocal('dashContents', 'getArtworks', callback);
        };

        factory.getTatsByArtistName = function(artistName, callback){
            cacheMaster.callOrCacheSession(artistName, 'getArtworksByArtist', callback);
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

/**
 * A simple example service that returns some data.
 */
    .factory('Friends', function () {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var friends = [
            { id: 0, name: 'Scruff McGruff' },
            { id: 1, name: 'G.I. Joe' },
            { id: 2, name: 'Miss Frizzle' },
            { id: 3, name: 'Ash Ketchum' }
        ];

        return {
            all: function () {
                return friends;
            },
            get: function (friendId) {
                // Simple index lookup
                return friends[friendId];
            }
        }
    });
