var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {

  $http({
    method: 'GET',
    url: '/is-admin'
  }).then(function successCallback (response) {
    $scope.is_admin = response.data.is_admin;
  });

  $http({
    method: 'GET',
    url: '/is-instructor'
  }).then(function successCallback (response) {
    $scope.is_instructor = response.data.is_instructor;
  });

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
  
  $scope.emailClassModal = function (class_id, class_name) {
    $scope.emailId = class_id;
    $scope.emailName = class_name;
    $scope.emailWarnings = [];
    $scope.emailSuccess = false;
    $scope.allSubject = '';
    $scope.allMessage = '';
    $("#classEmail").show();
    $("#classSubmit").show();
  }
  $scope.emailWarnings = [];
  
  $scope.sendEmail = function(class_id, class_name) {
    $scope.emailWarnings = [];
    if (!$scope.allSubject || $scope.allSubject == '') $scope.emailWarnings.push ('Subject is not specified.');
    if (!$scope.allMessage || $scope.allMessage == '') $scope.emailWarnings.push ('Message is not defined.');
    if ($scope.emailWarnings.length != 0) return;
    $http.post("/email-class", {
        subject: $scope.allSubject,
        body: $scope.allMessage,
        class_id: class_id,
        class_name: class_name
    }).then(function(response){
      if (response.data.success) {
        $scope.emailSuccess = true;
        $("#classEmail").hide();
        $("#classSubmit").hide();
        setTimeout (function () { $('#email-member-modal').modal('toggle'); }, 1500);
      } else {
        $scope.emailWarnings = [ 'Email was not successfully sent.' ];
        setTimeout (function () { $('#email-member-modal').modal('toggle'); }, 1500);
      }
    });
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
  };

  $scope.changeImg = function() {
      $scope.account.profile_image = $scope.image;
  };
});
