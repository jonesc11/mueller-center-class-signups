var app = angular.module("instructor-acc", []);
app.controller('controller', function ($scope, $http) {
  //Testing 
  $scope.account = {};
  $http({
    method: 'GET',
    url: '/get-account-info'
  }).then (function (response) {
    $scope.account = response.data;
  });
  $scope.editorEnabled = false;
  $scope.error1 = false;
  $scope.error2 = false;
  $scope.success = false;
  $scope.currentimg = true;
  $scope.newimg = false;
  
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

  $scope.imageUpload = function(element){
        var reader = new FileReader();
        reader.onload = $scope.imageIsLoaded;
        reader.readAsDataURL(element.files[0]);
  };

  $scope.imageIsLoaded = function(e){
        $scope.$apply(function() {
            $scope.image = e.target.result;
            $scope.currentimg = false;
            $scope.newimg = true;
        });
  };

  $scope.changeImg = function() {
      $scope.account.image = $scope.image;
  }


});
