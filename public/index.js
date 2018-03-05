var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.payment = 'cash';
  $scope.class = function(name) {
    $scope.class_name = name;  
  }
});