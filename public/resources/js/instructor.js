var app = angular.module("instructor-acc", []);
app.controller('controller', function ($scope, $http) {
  //Testing 
  $scope.account = {"name": "Sally","password":"abc123", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"};
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

  $scope.changePass = function() {
    if ($scope.oldpass != $scope.account.password){
      alert("Wrong Password! Try Again");
    }
    else if (($scope.oldpass == $scope.account.password) && ($scope.newpass != $scope.rtnewpass)){
      alert("New Password Does Not Match! Try Again");
    }
    else if (($scope.oldpass == $scope.account.password) && ($scope.newpass == $scope.rtnewpass)){
      $scope.account.password = $scope.newpass;
    }
  };

});