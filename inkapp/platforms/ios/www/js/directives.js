angular.module('ink.directives', [])

    .directive('artworkCard', ['LoginService', function(LoginService) {

        return {
            restrict: 'E',
            scope: {
                artwork: '=artwork'
            },
            templateUrl: 'templates/art-card.html'
        };
    }])