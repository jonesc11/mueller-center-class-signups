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
    $scope.editableFName = $scope.account.first_name;
    $scope.editableLName = $scope.account.last_name;
    $scope.editableBio = $scope.account.biography;
  };
  
  $scope.disableEditor = function() {
    $scope.editorEnabled = false;
  };
  
  $scope.save = function() {
    $scope.account.first_name = $scope.editableFName;
    $scope.account.last_name = $scope.editableLName;
    $scope.account.biography = $scope.editableBio;
    $scope.disableEditor();
    $http({
      method: 'POST',
      url: '/update-info',
      data: {
        fname: $scope.editableFName,
        lname: $scope.editableLName,
        biography: $scope.editableBio
      }
    }).then (function (response) {
    });;
  };

  $scope.changePassAlerts = [];
  $scope.changePass = function() {
    if ($scope.newpass != $scope.rtnewpass)
      $scope.changePassAlerts.push ('New passwords do not match.');
    if ($scope.changePassAlerts.length == 0) {
      $http({
        url: '/change-password',
        method: 'POST',
        data: {
          oldpass: $scope.oldpass,
          newpass: $scope.newpass
        }
      }).then (function (response) {
        if (response.data.success) {
          $('#passwordModal').modal('toggle');
        } else {
          $scope.changePassAlerts.push ('Old password is incorrect.');
        }
      });
    }
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
console.log ($('#img'));
  };

  $scope.changeImg = function() {
      $scope.account.profile_image = $scope.image;
  }

});
