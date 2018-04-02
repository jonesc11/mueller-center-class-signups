var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  //Some sample data just for front-end purposes
  $scope.instructor_accounts = [{"name": "Sally", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"}, {"name": "Bill", "email": "bill@gmail.com", "classes": ["Boxing", "Zumba"], "bio": "I'm Bill and I'm cool", "image": "/resources/img/i3.jpg"}];
  $scope.member_accounts = [{"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "Bursar", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "1"}, {"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "Cash", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "0"}];
  $scope.class_information = [{"name": "Pilates", "instructors": "Deb Something", "start_time": "12:00", "end_time": "13:00", "days": ["Monday", "Thursday"], "description": "Pilates yay!"}, {"name": "Zumba", "instructors": "Sally Sweatsalot", "start_time": "17:00", "end_time": "18:00", "days": ["Monday", "Thursday"], "description": "Zumba yay!"}, {"name": "Zumba 2", "instructors": "Joe Jumpingjacks", "start_time": "13:00", "end_time": "14:00", "days": ["Tuesday"], "description": "Zumba yay x2!"}];
  $scope.instructor_names = [{"name": "Deb Something"}, {"name": "Joe Jumpingjacks"}, {"name": "Sally Sweatsalot"}];
  
  $scope.inst = "Pending";
  $scope.classes = true;
  $scope.payment = "0";
  $scope.method = "Cash";
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
  $scope.deleteObject = function(obj) {
    $scope.delete_object = obj;  
  }
});