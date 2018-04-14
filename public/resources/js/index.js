var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.payment = 'cash';
  $scope.affiliation = 'ug-student';
  $scope.classModal = function(id, name) {
    $scope.class_id = id;  
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
  $scope.signUpErrors = [];
  $scope.signUp = function () {
    $scope.signUpErrors = [];
    if (!$scope.signupFName || $scope.signupFName == '') $scope.signUpErrors.push ('First name must be included.');
    if (!$scope.signupLName || $scope.signupLName == '') $scope.signUpErrors.push ('Last name must be included.');
    if (!$scope.signupEmail || $scope.signupEmail == '') $scope.signUpErrors.push ('Email must be included.');
    if (!$scope.signupPhone || $scope.signupPhone == '') $scope.signUpErrors.push ('Phone number must be included.');
    if ($scope.affiliation != 'community' && (!$scope.signupRin || $scope.signupRin == '')) $scope.signUpErrors.push ('RIN must be included.');
    if ($scope.signUpErrors.length != 0) return;
    $http({
      method: 'POST',
      url: '/enroll',
      data: {
        course: $scope.class_id,
        person: {
          first_name: $scope.signupFName,
          last_name: $scope.signupLName,
          email: $scope.signupEmail,
          phone: $scope.signupPhone,
          affiliation: $scope.affiliation,
          payment_method: $scope.payment,
          rin: $scope.signupRin ? $scope.signupRin : '',
          paid: false,
        }
      }
    }).then (function (response) {
      $('#sign-up').modal('toggle');
    });
  };
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
  $scope.class_information = [];
  $http({
    method: 'GET',
    url: '/get-courses'
  }).then(function successCallback (response) {
    $scope.class_information = response.data;
  });
});
