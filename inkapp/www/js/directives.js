angular.module('ink.directives', [])

    .directive('artworkCard', function(LoginService, secureSocket) {

        return {
            restrict: 'E',
            scope: {
                artwork: '='
            },
            templateUrl: 'templates/art-card.html',
            link: function(scope, elem) {
                scope.like = function(){
                    console.log("FUNK YEAH: " + scope.artwork.artistName);
                    scope.artwork.likes = scope.artwork.likes + 1;
                    LoginService.checkLoggedIn(function(data){
                        var whichFunc = true ? 'likePost' : 'unlikePost';
                        secureSocket.emit(whichFunc, scope.artwork._id, function(){
                            
                        });
                    });
                };
            }
        };
    })