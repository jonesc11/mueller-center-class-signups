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
  $scope.instructors = [{
    "first_name": "Sally",
    "last_name": "Sweatsalot",
    "email": "sally@gmail.com",
    "profile_image": "/resources/img/i2.jpg",
    "biography": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  }, {
    "first_name": "Bill",
    "last_name": "Bustamove",
    "email": "bill@gmail.com",
    "profile_image": "/resources/img/i3.jpg",
    "biography": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  }];
  $scope.class_information = [{
    "_id": "01",
    "name": "Pilates",
    "room": "1",
    "instructor": "Deb Something",
    "email": "deb@gmail.com",
    "frequency": {
      "start_time": "12:00",
      "end_time": "13:00",
      "days_of_week": ["Monday", "Friday"]
    },
    "semester": {
      "year": 2018,
      "term": "Spring"
    },
    "type": "Fitness",
    "is_archived": false,
    "description": "Pilates yay!",
    "persons_enrolled": [
      {
        "name": "Collin Jones",
        "email_address": "jonesc11@rpi.edu",
        "payment_method": "Bursar",
        "paid": true
      },
      {
        "name": "Yarden Neeman",
        "email_address": "neemay@rpi.edu",
        "payment_method": "Cash",
        "paid": false
      }
    ]
  },
  {
    "_id": "02",
    "name": "Zumba",
    "description": "Zumba yay!",
    "instructor": "Sally Sweatsalot",
    "email": "sally@gmail.com",
    "room": "2",
    "frequency": {
      "start_time": "17:00",
      "end_time": "18:00",
      "days_of_week": ["Monday", "Thursday"]
    },
    "semester": {
      "year": 2018,
      "term": "Spring"
    },
    "type": "Fitness",
    "is_archived": false,
    "persons_enrolled": [
      {
        "name": "Sydney Ruzicka",
        "email_address": "ruzics@rpi.edu",
        "payment_method": "Check",
        "paid": true
      },
      {
        "name": "Collin Jones",
        "email_address": "jonesc11@rpi.edu",
        "payment_method": "Bursar",
        "paid": false
      },
      {
        "name": "Yarden Neeman",
        "email_address": "neemay@rpi.edu",
        "payment_method": "Cash",
        "paid": true
      }
    ]
  }
];
});