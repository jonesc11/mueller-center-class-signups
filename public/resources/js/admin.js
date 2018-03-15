var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
});