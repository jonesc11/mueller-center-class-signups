var app = angular.module("instructor-acc", []);
app.controller('controller', function ($scope, $http) {
  //Testing 
  $scope.account = {"name": "Sally", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"};
  $scope.instructor_accounts = [{"name": "Sally", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"}, {"name": "Bill", "email": "bill@gmail.com", "classes": ["Boxing", "Zumba"], "bio": "I'm Bill and I'm cool", "image": "/resources/img/i3.jpg"}];
  $scope.editorEnabled = false;
  
  $scope.enableEditor = function() {
    $scope.editorEnabled = true;
    $scope.editableName = $scope.account.name;
    $scope.editableBio = $scope.account.bio;
  };
  
  $scope.disableEditor = function() {
    $scope.editorEnabled = false;
  };
  
  $scope.save = function() {
    $scope.account.name = $scope.editableName;
    $scope.account.bio = $scope.editableBio;
    $scope.disableEditor();
  };

});