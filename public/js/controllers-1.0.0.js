
var neueuControllers = angular.module('neueuControllers', [
    'neueuMap'
]);

neueuControllers.controller('UserController', ['$scope', '$http', '$interval', 'map',
    function ($scope, $http, $interval, map) {

        $http.post('user/load').success(function (response) {

            $scope.users = response

            map.init($scope.users, function () {
                // dirty zoombar position fix 
                $('.olControlPanZoomBar').css({ left: '', right: '30px' })
            })

            if ($scope.users.length > 0) {
                $scope.myself = $scope.users[0];
            }

            var task = function () {
                map.updatePosition(function (position) {
                    $http.post('user/update', { position: position })
                })
            }

            task();

            $interval(task, map.myself.updateInterval * 1000);
        })

        $scope.friendSelected = function (user) {
            map.setCenter(user.lon, user.lat)
        }

        $scope.loadHistory = function (user, period) {
            $http.post('user/history', { _id: user._id, period: period }).success(function (response) {
                if (response.user) {
                    map.showHistory(response.user)
                }
            });
        }

        $scope.hideHistory = function (user) {
            map.hideHistory(user._id)
        }

        $scope.saveSettings = function () {
            // TO+DO use modal controller to pass parameters
            $scope.myself.name = $('#name').val()

            $http.post('user/settings', { name: $scope.myself.name }).success(function () {
            });
        }

    }])