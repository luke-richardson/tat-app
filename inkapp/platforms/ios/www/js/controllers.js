angular.module('ink.controllers', [])

    .controller('DashCtrl', function ($scope, $ionicLoading, QueryTats) {
        $scope.cards = [];

        $scope.loadingIndicator = $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 50
        });

        QueryTats.execute('./testLib/test-data.json', function(data){
            $scope.cards = data;
            $scope.loadingIndicator.hide();
        });

    })

    .controller('ArtistDetailCtrl', function ($scope, $ionicLoading, $stateParams, QueryArtistById, QueryTats) {
        $scope.artist = {};
        $scope.artistArtworks = [];

        $scope.loadingIndicator = $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 50
        });

        QueryArtistById.execute('./testLib/test-artists.json', $stateParams.artistId, function(data){
            $scope.artist = data[$stateParams.artistId]; //But really the service should be fetching by artistID - this is for testing.
            $scope.artistPageTitle = $scope.artist.artistName + "'s profile"
            QueryTats.execute('./testLib/test-data.json', function(data){
                $scope.artistArtworks = data.filter(function(item){return item.artist.artistId === $scope.artist.artistId});
            });
            $scope.loadingIndicator.hide();
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
