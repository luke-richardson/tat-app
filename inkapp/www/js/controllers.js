angular.module('ink.controllers', [])

    .controller('MasterCtrl', function($scope, $rootScope){
        $scope.populateAccountPage = function(){
            console.log("populateAccountPage called - fucking higher level controllery hook cunty things");
            if($rootScope.populateAccountPage)  $rootScope.populateAccountPage();
        }
    })

    .controller('DashCtrl', function ($scope, $ionicLoading, QueryTats) {
        $scope.cards = [];

        $scope.moreDataCanBeLoaded = true;

        $scope.moreDataCanBeLoadedF = function () {
            console.log("Checking if data can be loaded");
            return $scope.moreDataCanBeLoaded;
        };


        $scope.loadTats = function (minDistance) {
            console.log("LOAD TATS CALLED with distance " + minDistance);
            QueryTats.execute(minDistance, function (data) {
                data.forEach(function (item) {
                    $scope.cards.push(item);
                });
                $scope.moreDataCanBeLoaded = data.length !== 0;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };


        $scope.loadMoreTats = function () {
            console.log("LOADIN TATS BITCH");
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

        QueryArtistById.execute($stateParams.artistID, function (data) {
            $scope.artist = data;
            $scope.artistPageTitle = $scope.artist.artistName + "'s profile"
            QueryTats.getTatsByArtistID($scope.artist._id, function (data) {
                $scope.artistArtworks = data;
                $ionicLoading.hide();
            });
        });
    })


    .controller('AccountCtrl', function ($scope, $ionicLoading, QueryTats, LoginService, secureSocket, $ionicPopup, $rootScope) {
        console.log("Entering the account controller");

        var onSuccess = function (profile) {
            console.log("On success being called");
            //onSuccess
            $scope.account = profile;
            $scope.avatarUploadMessage = profile.firstName + " " + profile.lastName;
            $ionicLoading.show({
                content: '<i class="icon ion-loading-c"></i>',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 50
            });

            QueryTats.getTatsByArtistID($scope.account._id, function (data) {
                $scope.artistArtworks = data;
                $ionicLoading.hide();
            });

            $scope.changeUsername = function () {
                $scope.data = {};
                $ionicPopup.show({
                    template: '<input type="text" ng-model="data.artistName">',
                    title: 'Change your display name',
                    subTitle: 'Nothing too naughty',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!$scope.data.artistName) {
                                    e.preventDefault();
                                } else {
                                    return $scope.data.artistName;
                                }
                            }
                        }
                    ]
                }).then(function (res) {
                    if (res) {
                        $scope.account.artistName = res;
                        secureSocket.emit("updateUsername", res, null);
                    }
                });
            };

            $scope.changeLocation = function () {
                $scope.data = {};
                $ionicPopup.show({
                    template: '<input type="text" ng-model="data.location">',
                    title: 'Change your location',
                    subTitle: 'Where are you based?',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!$scope.data.location) {
                                    e.preventDefault();
                                } else {
                                    return $scope.data.location;
                                }
                            }
                        }
                    ]
                }).then(function (res) {
                    if (res) {
                        $scope.account.location = res;
                        secureSocket.emit("updateLocation", res, null);
                    }
                });
            };

        };

        var initialised = $rootScope.populateAccountPage !== undefined;
        console.log("Initialised is: " + initialised);

        $rootScope.populateAccountPage = function(){
            console.log("Populate page for account called");
            LoginService.checkLoggedIn(onSuccess, function () {
                //onFailure
                console.log("On failure being called");
                $scope.account = { "artistName": "Billy no-mates",
                    "location": "Nowhere",
                    "artistAvatar": "./img/ios7-cloud-upload.png"};
                $scope.avatarUploadMessage = "Why don't you register an account?";
                $scope.accountArtworks = [];
                LoginService.showLogin(onSuccess);
            });
        };

        $scope.populateAccountPage = $rootScope.populateAccountPage;

        if(!initialised){
            $scope.populateAccountPage();
            initialised = true;
        }

        $scope.logOut = function () {
            LoginService.logOut();
        };


    });
