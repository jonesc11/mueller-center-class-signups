var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.payment = 'cash';
  $scope.affiliation = 'student';
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
  $scope.print_days = function(arr) {
    var output = "";
    for(var i in arr) {
      output += arr[i];
      if(i < arr.length - 1) {
        output += ", ";
      }
    }
    return output;
  }
  $scope.print_time = function(start,end) {
    var temp = "2018-01-01T";
    var date1 = new Date(temp + start);
    var date2 = new Date(temp + end);
    return date1.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + date2.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  $scope.instructors = [];
  $http({
    method: 'GET',
    url: '/get-instructors'
  }).then (function (response) {
    $scope.instructors = response.data;
  });

  $scope.class_information = [];
  $http({
    method: 'GET',
    url: '/get-courses'
  }).then(function successCallback (response) {
    $scope.class_information = response.data;
  });
});
