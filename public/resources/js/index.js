var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {

  $http({
    method: 'GET',
    url: '/is-admin'
  }).then(function successCallback (response) {
    $scope.is_admin = response.data.is_admin;
  });

  $http({
    method: 'GET',
    url: '/is-instructor'
  }).then(function successCallback (response) {
    $scope.is_instructor = response.data.is_instructor;
  });
  
  $scope.instructor_accounts = [];
  $http({
    url: '/get-instructors',
    method: 'GET'
  }).then (function (response) {
    $scope.instructor_accounts = response.data;
  });
  
  $scope.payment = 'cash';
  $scope.affiliation = 'ug-student';
  $scope.classModal = function(id, name, instructor, room, time, days) {
    $scope.class_id = id;  
    $scope.class_name = name;
    $scope.instructor = instructor;
    $scope.room = room;
    $scope.time = time;
    $scope.days = days;
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
        course: {
          course_id: $scope.class_id,
          course_name: $scope.class_name,
          instructor: $scope.instructor,
          time: $scope.time,
          room: $scope.room,
          days: $scope.days
        },
        person: {
          first_name: $scope.signupFName,
          last_name: $scope.signupLName,
          email: $scope.signupEmail,
          phone: $scope.signupPhone,
          affiliation: $scope.affiliation,
          payment_method: $scope.payment,
          rin: $scope.signupRin ? $scope.signupRin : '',
          paid: 'false',
        }
      }
    }).then (function (response) {
      $('#sign-up').modal('toggle');
      $('#success').modal('toggle');
    }).catch(function (response) {
      $('#error').modal('toggle');
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

  $scope.logout = function() {
    $http({
    method: 'GET',
    url: '/logout'
    }).then(function successCallback (response) {
      alert("logged out");
    });
  }

  $scope.class_information = [];
  $http({
    method: 'GET',
    url: '/get-courses'
  }).then(function successCallback (response) {
    $scope.class_information = response.data;
  });

  $scope.$on('instructorListRendered', function (ngRepeatFinishedEvent) {
    if(window.location.hash) {
      if (window.innerWidth < 676)
        window.scrollTo(0, $(window.location.hash).offset().top - 10);
      else
        $('#content').scrollTop($(window.location.hash).offset().top - 80);
    }
  });
});


app.filter('removeSpaces', [function() {
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
}])

// implemented from https://stackoverflow.com/a/44206573
app.directive('postRepeat', function($timeout) {
  return function(scope, element, attrs) {
    if (scope.$last){
      $timeout(function () {
        scope.$emit(attrs.postRepeat);
      });
    }
  };
});


