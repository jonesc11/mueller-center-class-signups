var app = angular.module("instructor-acc", []);
app.controller('controller', function ($scope, $http) {
  //Testing 
  $scope.account = {"name": "Sally", "email": "sally@gmail.com", "classes": ["Yoga", "Pilates"], "bio": "I'm Sally and I'm cool", "image": "/resources/img/i2.jpg"};
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

  $scope.sendEmail = function() {
    $http.post("/email/class", {
        //send form parameters
        params: {
            subject: $scope.subject,
            body: $scope.body,
            //class_id: $scope.class_id 
        }
    }).then(function(){
        alert("Email Sent");
    });
  };

});