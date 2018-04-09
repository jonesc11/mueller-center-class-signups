var app = angular.module("instructor-acc", []);
app.controller('controller', function ($scope, $http) {
  //Testing 
  $scope.account = {"name": "Sally","password":"abc123", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"};
  $scope.editorEnabled = false;
  $scope.error1 = false;
  $scope.error2 = false;
  $scope.success = false;
  
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

  $scope.changePass = function() {
    document.getElementById("change-pass").reset();
    if ($scope.oldpass != $scope.account.password){
      $scope.error1 = true;
      $scope.error2 = false;
      $scope.success = false;
    }
    else if (($scope.oldpass == $scope.account.password) && ($scope.newpass != $scope.rtnewpass)){
      $scope.error2 = true;
      $scope.error1 = false;
      $scope.success = false;
    }
    else if (($scope.oldpass == $scope.account.password) && ($scope.newpass == $scope.rtnewpass)){
      $scope.account.password = $scope.newpass;
      $scope.success = true;
      $scope.error1 = false;
      $scope.error2 = false;
    }
  };

  $scope.resetPass = function(){
    $scope.error1 = false;
    $scope.error2 = false;
    $scope.success = false;
  };

});