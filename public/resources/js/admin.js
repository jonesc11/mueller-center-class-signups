var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  //Some sample data just for front-end purposes
  $scope.instructor_accounts = [{"name": "Sally", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"}, {"name": "Bill", "email": "bill@gmail.com", "classes": ["Boxing", "Zumba"], "bio": "I'm Bill and I'm cool", "image": "/resources/img/i3.jpg"}];
  $scope.member_accounts = [{"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "bursar", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "paid"}, {"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "bursar", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "paid"}];
  $scope.classes = true;
  $scope.changeTab = function(event, val) {
    $(".nav-link").removeClass("active");
    $(event.target).addClass("active");
    $scope.classes = false;
    $scope.instructors = false;
    $scope.members = false;
    if(val == 'c')
      $scope.classes = true;
    else if(val == 'i')
      $scope.instructors = true;
    else
      $scope.members = true;
  }
});