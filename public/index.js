var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.payment = 'cash';
  $scope.class = function(name) {
    $scope.class_name = name;  
  }
  $scope.detail_text = "Details";
  $scope.toggle_show = function() {
    $("#sidebar").toggle();
    if($scope.detail_text == "Details")
      $scope.detail_text = "Less";
    else
      $scope.detail_text = "Details";
  }
});