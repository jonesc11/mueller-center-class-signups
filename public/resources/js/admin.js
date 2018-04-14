var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  //Some sample data just for front-end purposes
  $scope.instructor_accounts = [];
  $http({
    url: '/get-instructors',
    method: 'GET'
  }).then (function (response) {
    $scope.instructor_accounts = response.data;
  });
  $scope.member_accounts = [{"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "Bursar", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "1"}, {"name": "Yarden Ne'eman", "email": "neemay@rpi.edu", "rin": "660000000", "payment_method": "Cash", "classes": ["Kettlebell Kickboxing", "Core Yoga"], "payment_status": "0"}];
  $scope.class_information = [];
  $http({
    method: 'GET',
    url: '/get-courses'
  }).then(function (response) {
    $scope.class_information = response.data;
  });
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
  $scope.alertList = [];
  $scope.verifyAdded = false;
  $scope.verifyUpdated = false;
  $scope.addOrEdit = function () {
    $scope.alertList = [];
    if (!$scope.className || $scope.className == '') $scope.alertList.push ('Class name is empty.');
    if (!$scope.classRoom || $scope.classRoom == '') $scope.alertList.push ('Class room is empty.');
    if (!$scope.classStart || $scope.classStart == '') $scope.alertList.push ('Class start is not specified.');
    if (!$scope.classEnd || $scope.classEnd == '') $scope.alertList.push ('Class end is not specified.');
    if ($scope.classType != 'Fitness' && $scope.classType != 'Enrichment') $scope.alertList.push ('Class type is not specified.');
    if (!$scope.classDescription || $scope.classDescription == '') $scope.alertList.push ('Class description is not specified.');

    var days = [];
    if ($scope.monday) days.push ('Monday');
    if ($scope.tuesday) days.push ('Tuesday');
    if ($scope.wednesday) days.push ('Wednesday');
    if ($scope.thursday) days.push ('Thursday');
    if ($scope.friday) days.push ('Friday');
    if ($scope.saturday) days.push ('Saturday');
    if ($scope.sunday) days.push ('Sunday');
    if (days.length == 0) $scope.alertList.push ('No days were selected.');
    if ($scope.alertList.length != 0) return;
    if ($scope.buttonState == "Add Class") {
      $http({
        method: 'POST',
        url: '/add-class',
        data: {
          name: $scope.className,
          instructor: $scope.instructorName,
          room: $scope.classRoom,
          frequency: {
            start_time: $scope.classStart.getHours() + ":" + $scope.classStart.getMinutes(),
            end_time: $scope.classEnd.getHours() + ":" + $scope.classEnd.getMinutes(),
            days_of_week: days
          },
          description: $scope.classDescription,
          type: $scope.classType,
          is_archived: false,
          is_sign_up_able: true,
          persons_enrolled: []
        }
      }).then (function (response) {
      });
      $scope.verifyAdded = true;
    } else {

    }
  };
  $scope.deleteCourse = function () {
    $http({
      method: 'POST',
      url: '/delete-course',
      data: {
        course: $scope.class_information[$scope.editClass]._id
      }
    }).then (function (response) {});
  };
  $scope.archiveCourse = function () {
    $http({
      method: 'POST',
      url: '/archive-course',
      data: {
        course: $scope.class_information[$scope.editClass]._id
      }
    }).then (function (response) {});
  };
  $scope.submitEditClass = function() {
    $scope.buttonState = "Save Changes";
    $scope.verifyAdded = false;
    $scope.verifyUpdated = false;
    $scope.editing = true;
    $scope.className = $scope.class_information[$scope.editClass].name;
    $scope.classSession = $scope.class_information[$scope.editClass].session_id;
    $scope.instructorName = $scope.class_information[$scope.editClass].instructor_id;
    $scope.classRoom = $scope.class_information[$scope.editClass].room;
    var time = "2018-01-01T";
    $scope.classStart = new Date(time + $scope.class_information[$scope.editClass].frequency.start_time + ":00");
    $scope.classEnd = new Date(time + $scope.class_information[$scope.editClass].frequency.end_time + ":00");
    $scope.monday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Monday");
    $scope.tuesday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Tuesday");
    $scope.wednesday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Wednesday");
    $scope.thursday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Thursday");
    $scope.friday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Friday");
    $scope.saturday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Saturday");
    $scope.sunday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Sunday");
    $scope.classDescription = $scope.class_information[$scope.editClass].description;
    $scope.classType = $scope.class_information[$scope.editClass].type;
  }
  $scope.createAcctErrs = [];
  $scope.createAccount = function () {
    if ($scope.createAcctFName == '')
      $scope.createAcctErrs.push ('First name must be included.');
    if ($scope.createAcctLName == '')
      $scope.createAcctErrs.push ('Last name must be included.');
    if ($scope.createAcctEmail == '')
      $scope.createAcctErrs.push ('Email must be included.');

    if ($scope.createAcctErrs.length == 0) {
      $http({
        method: 'POST',
        url: '/add-account',
        data: {
          fname: $scope.createAcctFName,
          lname: $scope.createAcctLName,
          email: $scope.createAcctEmail
        }
      }).then (function (response) {
        $('#add-account').modal('toggle');
      });
    }
  };
});
