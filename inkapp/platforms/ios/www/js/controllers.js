angular.module('ink.controllers', [])

    .controller('DashCtrl', ['$scope', 'QueryTats', function ($scope, QueryTats) {
        $scope.cards = [];

        QueryTats.execute('./testLib/test-data.json', function(data){
            $scope.cards = data;
        });

    }])

    .controller('ArtistDetailCtrl', function ($scope, $stateParams, QueryArtistById, QueryTats) {
        $scope.artist = {};

        QueryArtistById.execute('./testLib/test-artists.json', $stateParams.artistId, function(data){
            $scope.artist = data[$stateParams.artistId]; //But really the service should be fetching by artistID - this is for testing.
            $scope.artistPageTitle = $scope.artist.artistName + "'s profile"
        });

        $scope.artistArtworks = [];

        QueryTats.execute('./testLib/test-data.json', function(data){
            $scope.artistArtworks = data.filter(function(item){return item.artist.artistId === $scope.artist.artistId});
        });

    })

    .controller('FriendsCtrl', function ($scope, Friends) {
        $scope.friends = Friends.all();
    })

    .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
    })

    .controller('AccountCtrl', function ($scope) {
    });
