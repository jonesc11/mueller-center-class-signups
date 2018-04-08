var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  //Some sample data just for front-end purposes
  $scope.instructor_accounts = [{"name": "Sally", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"}, {"name": "Bill", "email": "bill@gmail.com", "classes": ["Boxing", "Zumba"], "bio": "I'm Bill and I'm cool", "image": "/resources/img/i3.jpg"}];
  $scope.member_accounts = [{"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "Bursar", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "1"}, {"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "Cash", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "0"}];
  $scope.class_information = [{"_id": "01", "name": "Pilates", "instructor": "Deb Something", "room": "1", "start_time": "12:00", "end_time": "13:00", "days": ["Monday", "Thursday"], "description": "Pilates yay!"}, {"_id": "02", "name": "Zumba", "instructor": "Sally Sweatsalot", "room": "2", "start_time": "17:00", "end_time": "18:00", "days": ["Monday", "Thursday"], "description": "Zumba yay!"}, {"_id": "03", "name": "Zumba 2", "instructor": "Joe Jumpingjacks", "room": "3", "start_time": "13:00", "end_time": "14:00", "days": ["Tuesday"], "description": "Zumba yay x2!"}];
  $scope.instructor_names = [{"name": "Deb Something"}, {"name": "Joe Jumpingjacks"}, {"name": "Sally Sweatsalot"}];
  $scope.rooms = ["1", "2", "3", "4"];
  $scope.roomNum = $scope.rooms[0];
  $scope.editClass = "0";
  $scope.instructorName = "Pending";
  $scope.classSession = 1;
  $scope.classType = "fitness";
  $scope.classes = true;
  $scope.payment = "0";
  $scope.method = "Cash";
  $scope.buttonState = "Add Class";
  $scope.editing = false;
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
  $scope.checkArray = function(arr, val) {
    for(var i in arr) {
      if(arr[i]==val) {
        return true;
      }
    }
    return false;
  }
  $scope.submitEditClass = function() {
    $scope.buttonState = "Save Changes";
    $scope.editing = true;
    $scope.className = $scope.class_information[$scope.editClass].name;
    $scope.classSession = $scope.class_information[$scope.editClass].session;
    $scope.instructorName = $scope.class_information[$scope.editClass].instructor;
    $scope.classRoom = $scope.class_information[$scope.editClass].room;
    var time = "2018-01-01T";
    $scope.classStart = new Date(time + $scope.class_information[$scope.editClass].start_time + ":00");
    $scope.classEnd = new Date(time + $scope.class_information[$scope.editClass].end_time + ":00");
    $scope.monday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Monday");
    $scope.tuesday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Tuesday");
    $scope.wednesday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Wednesday");
    $scope.thursday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Thursday");
    $scope.friday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Friday");
    $scope.saturday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Saturday");
    $scope.sunday = $scope.checkArray($scope.class_information[$scope.editClass].days, "Sunday");
    $scope.classDescription = $scope.class_information[$scope.editClass].description;
  }
});