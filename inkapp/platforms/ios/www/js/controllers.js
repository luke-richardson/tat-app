angular.module('ink.controllers', [])

    .controller('DashCtrl', function ($scope, $ionicLoading, QueryTats) {

        $scope.cards = [];

        $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 50
        });

        QueryTats.execute(function (data) {
            $scope.cards = data;
            $ionicLoading.hide();
        });

    })

    .controller('ArtistDetailCtrl', function ($scope, $ionicLoading, $stateParams, QueryArtistById, QueryTats) {
        $scope.artist = {};
        $scope.artistArtworks = [];

        $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 50
        });

        QueryArtistById.execute($stateParams.artistName, function (data) {
            $scope.artist = data;
            $scope.artistPageTitle = $scope.artist.artistName + "'s profile"
            QueryTats.getTatsByArtistName($scope.artist.artistName, function (data) {
                $scope.artistArtworks = data;
                $ionicLoading.hide();
            });
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
