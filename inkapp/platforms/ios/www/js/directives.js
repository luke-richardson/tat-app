angular.module('ink.directives', [])

    .directive('artworkCard', function (LoginService, secureSocket, $ionicTabsDelegate, $rootScope) {

        return {
            restrict: 'E',
            scope: {
                artwork: '='
            },
            templateUrl: 'templates/art-card.html',
            link: function (scope, elem) {
                console.log("LINK for art card being called");
                LoginService.checkLoggedIn(function(profile){
                    scope.likedByUser = scope.artwork.likes.indexOf(angular.fromJson(profile)._id) > -1;
                }, function(){
                    scope.likedByUser = false;
                })
                console.log("LikedByUser is: " + scope.likedByUser);

                scope.like = function () {
                    console.log("LIKE called on: " + scope.artwork.artistName);
                    LoginService.checkLoggedIn(function (profile) {
                        var whichFunc = scope.likedByUser ? 'unlikePost' : 'likePost';
                        console.log("We're logged in - going to invocate the " + " function because: " + scope.artwork.likes);
                        secureSocket.emit(whichFunc, scope.artwork._id, function (newLikes) {
                            console.log("New likes array is: " + newLikes);
                            scope.artwork.likes = newLikes;
                            console.log("Likes array on object is: " + scope.artwork.likes);
                            scope.likedByUser = scope.artwork.likes.indexOf(profile._id) > -1;
                            console.log("New value of likedByUser is: " + scope.likedByUser);
                        });
                    }, function(){
                        $ionicTabsDelegate.select($rootScope.pageIndices.loginPage, true);
                    });
                };
            }
        };
    })