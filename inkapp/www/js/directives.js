angular.module('ink.directives', [])

    .directive('artworkCard', function() {
        return {
            restrict: 'E',
            scope: {
                artwork: '=artwork'
            },
            templateUrl: 'templates/art-card.html'
        };
    })