var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {

  //Function to determine if this user is an admin
  $http({
    method: 'GET',
    url: '/is-admin'
  }).then(function successCallback (response) {
    $scope.is_admin = response.data.is_admin;
  });

  //Function to determine if this user is an instructor
  $http({
    method: 'GET',
    url: '/is-instructor'
  }).then(function successCallback (response) {
    $scope.is_instructor = response.data.is_instructor;
  });
  
  //Function to get instructor account information
  //Stores the response data in instructor_accounts array
  $scope.instructor_accounts = [];
  $http({
    url: '/get-instructors',
    method: 'GET'
  }).then (function (response) {
    $scope.instructor_accounts = response.data;
  });
  
  //Set default values for payment and affiliation in signup form
  $scope.payment = 'cash';
  $scope.affiliation = 'ug-student';
  
  //When the sign up button is clicked, this function is called and the values
  //for this class are stored in the respective variables
  $scope.classModal = function(id, name, instructor, room, time, days) {
    $scope.class_id = id;  
    $scope.class_name = name;
    $scope.instructor = instructor;
    $scope.room = room;
    $scope.time = time;
    $scope.days = days;
  }
  
  //Function to toggle the sidebar when screen size is < 800px
  $scope.detail_text = "Details";
  $scope.toggle_show = function() {
    $("#sidebar").toggle();
    if($scope.detail_text == "Details")
      $scope.detail_text = "Less";
    else
      $scope.detail_text = "Details";
  }
  
  //Function that is called when a user signs up for a class
  //The form is checked for errors, any errors are stored in signUpErrors and displayed
  $scope.signUpErrors = [];
  $scope.signUp = function () {
    $scope.signUpErrors = [];
    if (!$scope.signupFName || $scope.signupFName == '') $scope.signUpErrors.push ('First name must be included.');
    if (!$scope.signupLName || $scope.signupLName == '') $scope.signUpErrors.push ('Last name must be included.');
    if (!$scope.signupEmail || $scope.signupEmail == '') $scope.signUpErrors.push ('Email must be included.');
    if (!$scope.signupPhone || $scope.signupPhone == '') $scope.signUpErrors.push ('Phone number must be included.');
    if ($scope.affiliation != 'community' && (!$scope.signupRin || $scope.signupRin == '')) $scope.signUpErrors.push ('RIN must be included.');
    //If there are any errors, do not continue
    if ($scope.signUpErrors.length != 0) return;
    //If there are no errors, call the enroll function to enroll in the class
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
    }).then (function (response) { //on success
      $('#sign-up').modal('toggle');
      $('#success').modal('toggle');
    }).catch(function (response) { //on failure
      $('#error').modal('toggle');
    });
  };
  
  //Function to print out the days the class is offered as a comma separated string
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
  
  //Function to display the time in a more readable format
  $scope.print_time = function(start,end) {
    var temp = "2018-01-01T";
    var date1 = new Date(temp + start);
    var date2 = new Date(temp + end);
    return date1.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + date2.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  
  //If the user was a logged in admin, the logout button is shown on the page
  //If it is clicked, logout the user
  $scope.logout = function() {
    $http({
    method: 'GET',
    url: '/logout'
    }).then(function successCallback (response) {
      alert("logged out");
    });
  }

  //Function to get the class information
  $scope.class_information = [];
  $http({
    method: 'GET',
    url: '/get-courses'
  }).then(function successCallback (response) {
    $scope.class_information = response.data;
  });

  //Function that scrolls the user down to the instructor specified in the URL
  $scope.$on('instructorListRendered', function (ngRepeatFinishedEvent) {
    if(window.location.hash) {
      if (window.innerWidth < 800)
        window.scrollTo(0, $(window.location.hash).offset().top - 10);
      else
        $('#content').scrollTop($(window.location.hash).offset().top - 80);
    }
  });
});

//Function to remove the space from the instructor name
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


