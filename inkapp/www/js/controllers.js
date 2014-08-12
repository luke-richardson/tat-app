angular.module('starter.controllers', [])

    .controller('DashCtrl', ['$scope', 'QueryTats', function ($scope, QueryTats) {
        $scope.cards = [];

        QueryTats.execute('./testLib/test-data.json').success(function(data){
            $scope.cards = data;
        });

    }])

    .controller('FriendsCtrl', function ($scope, Friends) {
        $scope.friends = Friends.all();
    })

    .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
    })

    .controller('AccountCtrl', function ($scope) {
    });
