var app = angular.module("mueller-sign-up", []);
app.controller('controller', function ($scope, $http) {
  $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  $scope.instructor_accounts = [];
  $scope.admin_accounts = [];
  $scope.getInstructors = function() {
   $http({
      url: '/get-instructors',
      method: 'GET'
    }).then (function (response) {
      $scope.instructor_accounts = response.data;
      $scope.instructorName = $scope.instructor_accounts[0]._id;
    }); 
  }
  
  $scope.getInstructors(); //initial call to get instructors
  
  $http({
    url: '/get-admins',
    method: 'GET'
  }).then (function (response) {
    $scope.admin_accounts = response.data;
  });
  
  $scope.member_accounts = [];
  $http({
    method: 'GET',
    url: '/get-members'
  }).then (function (response) {
    $scope.member_accounts = response.data.members;
  });

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
  
  $scope.class_information = [];
  $scope.getClasses = function() {
    $http({
      method: 'GET',
      url: '/get-courses'
    }).then(function (response) {
      $scope.class_information = response.data;
    });
  }
  $scope.getClasses(); //initial call to get classes
  
  $scope.classes = true;
  $scope.payment = "0";
  $scope.method = "Cash";
  $scope.classTerm = "Fall";
  
  $scope.setAddState = function() {
    $scope.className = "";
    $scope.classRoom = "";
    $scope.classStart = "";
    $scope.classEnd = "";
    $scope.classType = "Fitness";
    $scope.classDescription = "";
    $scope.monday = false;
    $scope.tuesday = false;
    $scope.wednesday = false;
    $scope.thursday = false;
    $scope.friday = false;
    $scope.saturday = false;
    $scope.sunday = false;
    $scope.editClass = "0";
    $scope.buttonState = "Add Class";
    $scope.editing = false;
  }
  
  $scope.setAddState(); //initial call to set add state
  
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
  $scope.deleteMember = function () {
    for (var i = 0; i < $scope.member_accounts.length; ++i) {
      if ($scope.member_accounts[i].email.toLowerCase() == $scope.delete_object.toLowerCase()) {
        $scope.member_accounts.splice (i, 1);
        break;
      }
    }

    $http({
      method: 'POST',
      url: '/delete-member',
      data: {
        email: $scope.delete_object
      }
    }).then (function (response) {});
  }
  $scope.onMemberChange = function (type) {
    $http({
      method: 'POST',
      url: '/change-member',
      data: {
        email: this.member.email,
        method: this.member.payment_method,
        paid: this.member.paid
      }
    }).then (function (response) {});
  }
  $scope.emailMemberModal = function (email) {
    $scope.memToEmail = email;
    $scope.emailWarnings = [];
    $scope.emailSuccess = false;
    $scope.indSubject = '';
    $scope.indMessage = '';
    $("#individualEmail").show();
    $("#individualSubmit").show();
  }
  $scope.emailWarnings = [];
  $scope.emailInd = function () {
    $scope.emailWarnings = [];
    if (!$scope.indSubject || $scope.indSubject == '') $scope.emailWarnings.push ('Subject is not specified.');
    if (!$scope.indMessage || $scope.indMessage == '') $scope.emailWarnings.push ('Message is not defined.');
    if ($scope.emailWarnings.length != 0) return;
    $http({
      method: 'POST',
      url: '/email/ind',
      data: {
        email: $scope.memToEmail,
        subject: $scope.indSubject,
        message: $scope.indMessage
      }
    }).then (function (response) {
      if (response.data.success) {
        $scope.emailSuccess = true;
        $("#individualEmail").hide();
        $("#individualSubmit").hide();
        setTimeout (function () { $('#email-member-modal').modal('toggle'); }, 1500);
      } else {
        $scope.emailWarnings = [ 'Email was not successfully sent.' ];
        setTimeout (function () { $('#email-member-modal').modal('toggle'); }, 1500);
      }
    });
  }
  
  $scope.setRemoveMember = function(email, fname, lname, cname, id, $index) {
    $scope.removeEmail = email;
    $scope.removeId = id;
    $scope.removeIndex = $index;
    $scope.removeName = fname + " " + lname;
    $scope.removeClass = cname;
  }
  
  $scope.removeMember = function () {
    for (var i = 0; i < $scope.member_accounts.length; ++i) {
      if ($scope.member_accounts[i].email.toLowerCase() == $scope.removeEmail.toLowerCase()) {
        $scope.member_accounts[i].classes.splice ($scope.removeIndex, 1);
      }
    }
    $http({
      method: 'POST',
      url: '/remove-member',
      data: {
        course: $scope.removeId,
        email: $scope.removeEmail
      }
    }).then (function (response) {
    });
  };
  
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
            start_time: ($scope.classStart.getHours() < 10 ? '0' + $scope.classStart.getHours() : $scope.classStart.getHours()) + ":" + ($scope.classStart.getMinutes() < 10 ? '0' + $scope.classStart.getMinutes() : $scope.classStart.getMinutes()),
            end_time: ($scope.classEnd.getHours() < 10 ? '0' + $scope.classEnd.getHours() : $scope.classEnd.getHours()) + ":" + ($scope.classEnd.getMinutes() < 10 ? '0' + $scope.classEnd.getMinutes() : $scope.classEnd.getMinutes()),
            days_of_week: days
          },
          description: $scope.classDescription,
          type: $scope.classType,
          is_archived: false,
          is_sign_up_able: true,
          persons_enrolled: []
        }
      }).then (function (response) {
        $scope.getClasses();
        if (response.data.success) {
          $scope.verifyAdded = true;
          $scope.classAddMessage = " Class successfully added!";
          setTimeout (function () { $scope.verifyAdded = false; }, 1000);
          $scope.className = "";
          $scope.instructorName = $scope.instructor_accounts[0]._id;
          $scope.classRoom = "";
          $scope.classStart = "";
          $scope.classEnd = "";
          $scope.classType = "Fitness";
          $scope.classDescription = "";
          $scope.monday = false;
          $scope.tuesday = false;
          $scope.wednesday = false;
          $scope.thursday = false;
          $scope.friday = false;
          $scope.saturday = false;
          $scope.sunday = false;
        }
        else {
          $scope.verifyAdded = true;
          $scope.classAddMessage = " Class could not be added.";
          setTimeout (function () { $scope.verifyAdded = false; }, 1000);
        }
      });
    } else {
      $http({
        method: 'POST',
        url: '/edit-course',
        data: {
          course: $scope.class_information[$scope.editClass]._id,
          update: {
            name: $scope.className,
            instructor: $scope.instructorName,
            room: $scope.classRoom,
            frequency: {
              start_time: ($scope.classStart.getHours() < 10 ? '0' + $scope.classStart.getHours() : $scope.classStart.getHours()) + ":" + ($scope.classStart.getMinutes() < 10 ? '0' + $scope.classStart.getMinutes() : $scope.classStart.getMinutes()),
              end_time: ($scope.classEnd.getHours() < 10 ? '0' + $scope.classEnd.getHours() : $scope.classEnd.getHours()) + ":" + ($scope.classEnd.getMinutes() < 10 ? '0' + $scope.classEnd.getMinutes() : $scope.classEnd.getMinutes()),
              days_of_week: days
            },
            description: $scope.classDescription,
            type: $scope.classType,
          }
        }
      }).then (function (response) {
        $scope.getClasses();
        if (response.data.success) {
          $scope.verifyUpdated = true;
          $scope.classUpdateMessage = " Class successfully updated!";
          setTimeout (function () { $scope.verifyUpdated = false; }, 1000);
        }
        else {
          $scope.verifyUpdated = true;
          $scope.classUpdateMessage = " Class could not be updated.";
          setTimeout (function () { $scope.verifyUpdated = false; }, 1000);
        }
      });
    }
  };
  
  $scope.deleteCourse = function () {
    $http({
      method: 'POST',
      url: '/delete-course',
      data: {
        course: $scope.class_information[$scope.editClass]._id
      }
    }).then (function (response) {
      $scope.getClasses();
      if(response.data.success) {
        $scope.setAddState();
        $scope.verifyDelete = true;
        $scope.classDeleteMessage = " Class successfully deleted!";
        setTimeout (function () { $scope.verifyDelete = false; }, 1000);
      }
      else {
        $scope.verifyDelete = true;
        $scope.classDeleteMessage = " Class could not be deleted.";
        setTimeout (function () { $scope.verifyDelete = false; }, 1000);
      }
    });
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
    $scope.classStart = new Date(time + $scope.class_information[$scope.editClass].frequency.start_time);
    $scope.classEnd = new Date(time + $scope.class_information[$scope.editClass].frequency.end_time);
    $scope.monday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Monday");
    $scope.tuesday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Tuesday");
    $scope.wednesday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Wednesday");
    $scope.thursday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Thursday");
    $scope.friday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Friday");
    $scope.saturday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Saturday");
    $scope.sunday = $scope.checkArray($scope.class_information[$scope.editClass].frequency.days_of_week, "Sunday");
    $scope.classDescription = $scope.class_information[$scope.editClass].description;
    $scope.classType = $scope.class_information[$scope.editClass].type;
    if($scope.class_information[$scope.editClass].is_sign_up_able)
      $scope.toggleSignups = "Close Registration";
    else
      $scope.toggleSignups = "Open Registration";
  }
  
  $scope.createAcctErrs = [];
  $scope.createAccount = function () {
    if (!$scope.createAcctFName | $scope.createAcctFName == '')
      $scope.createAcctErrs.push ('First name must be included.');
    if (!$scope.createAcctLName | $scope.createAcctLName == '')
      $scope.createAcctErrs.push ('Last name must be included.');
    if (!$scope.createAcctEmail | $scope.createAcctEmail == '')
      $scope.createAcctErrs.push ('Email must be included.');
    //TODO - check that either checkbox is selected (must be at least one, can be both)
    if ($scope.createAcctErrs.length == 0) {
      //TODO - assign privileges
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

  $scope.unflagBio = function ($index, from) {
    $http({
      method: 'POST',
      url: '/unflag-bio',
      data: {
        email: this.account.email
      }
    }).then (function (response) {
    });

    $scope[from][$index].bio_is_flagged = false;
  };

  $scope.unflagImg = function ($index, from) {
    $http({
      method: 'POST',
      url: '/unflag-img',
      data: {
        email: this.account.email
      }
    }).then (function (response) {
    });

    $scope[from][$index].img_is_flagged = false;
  };

  $scope.flagBio = function ($index, from) {
    $http({
      method: 'POST',
      url: '/flag-bio',
      data: {
        email: this.account.email
      }
    }).then (function (response) {
    });

    $scope[from][$index].bio_is_flagged = true;
  };

  $scope.flagImg = function ($index, from) {
    $http({
      method: 'POST',
      url: '/flag-img',
      data: {
        email: this.account.email
      }
    }).then (function (response) {
    });

    $scope[from][$index].img_is_flagged = true;
  };

  $scope.logout = function() {
    $http({
    method: 'GET',
    url: '/logout'
    }).then(function successCallback (response) {
      alert("logged out");
    });
  }
  
  $scope.setDelete = function(email, id) {
    $scope.delete_email = email;
    $scope.delete_id = id;
  }
  
  $scope.deleteAccount = function() {
    //TODO - Delete instructor account (also delete their information form the courses they are listed under? Or do we just assume that they'll know to change it)
  }
  
  $scope.toggleRegistration = function() {
    //TODO - toggle is_sign_up_able
    if($scope.class_information[$scope.editClass].is_sign_up_able)
      $scope.toggleSignups = "Open Registration";
    else
      $scope.toggleSignups = "Close Registration";
  }
});
