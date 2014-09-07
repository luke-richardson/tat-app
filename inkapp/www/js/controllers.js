angular.module('ink.controllers', [])

    .controller('DashCtrl', function ($scope, $ionicLoading, QueryTats) {

        $scope.cards = [];

        $scope.moreDataCanBeLoaded = true;

        $scope.moreDataCanBeLoadedF = function () {
            return $scope.moreDataCanBeLoaded;
        };


        $scope.loadTats = function (minDistance) {
            QueryTats.execute(minDistance, function (data) {
                data.forEach(function (item) {
                    $scope.cards.push(item);
                });
                $scope.moreDataCanBeLoaded = data.length !== 0;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };


        $scope.loadMoreTats = function () {
            var dis = null;
            if ($scope.cards.length === 0) {
                dis = 0;
            } else {
                dis = $scope.cards[$scope.cards.length - 1].dis + 0.000000001;
            }
            $scope.loadTats(dis);
        };

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


    .controller('AccountCtrl', function ($scope, $ionicLoading, QueryTats, LoginService) {

        LoginService.checkLoggedIn(function (profile) {
            //onSuccess
            $scope.account = profile;
            $scope.avatarUploadMessage = "Looking good!";
            $ionicLoading.show({
                content: '<i class="icon ion-loading-c"></i>',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 50
            });
            QueryTats.getTatsByArtistName($scope.account.artistName, function (data) {
                $scope.artistArtworks = data;
                $ionicLoading.hide();
            });
        }, function () {
            //onFailure
            $scope.account = { "artistName": "Billy no-mates",
                "location": "Nowhere",
                "artistAvatar": "./img/ios7-cloud-upload.png"};
            $scope.avatarUploadMessage = "Why don't you register an account?";
            $scope.accountArtworks = [];
        });

        $scope.logOut = function () {
            LoginService.logOut();
        };


    });
