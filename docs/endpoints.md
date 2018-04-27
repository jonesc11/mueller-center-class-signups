# Endpoint Documentation

This file explains all of the endpoints on the server that are used for any HTTP requests from AngularJS or simply page hosting.
This includes the URL, the type of request, required parameters, and return values.

## GET Requests

### /

Sends the homepage (/pages/index.html). Requires no parameters or permissions.

This is accessible by everyone.

### /instructors

Sends the instructor list page (/pages/instructor_list.html). Requires no parameters or permissions.

This is accessible by everyone.

### /admin

Sends the admin panel page (/pages/admin.html) if the user is logged in as an administrator, or redirects the user to the
homepage if otherwise. Requires no parameters.

This is accessible by administrators.

### /account

Sends the account panel page (/pages/account.html) if the user is logged in as an instructor or an administrator, or redirects
the user to the homepage if otherwise. Requires no parameters.

This is accessible by any logged in user.

### /login

Sends the login page (/pages/login.html) if the user is not logged in, otherwise it redirects the user to the account panel.
Requires no parameters.

This is accessible by everyone.

### /is-admin

Returns whether the current user is an admin or not.

This is accessible by everyone.

This request requires no parameters and a JSON object that looks like this:

```
{
  is_admin: true|false
}
```

* `is_admin` is true if the sender is an administrator, and false otherwise.

`NOTE:` This should not be used for securing pages or resource from a user. Primarily, we use it to hide certain links to
pages that are protected by other means. Use caution when using this page.

### /is-instructor

Returns whether the current user is an instructor or not.

This is accessible by everyone.

This request requires no parameters and a JSON object that looks like this:

```
{
  is_instructor: true|false
}
```

* `is_instructor` is true if the sender is an administrator, and false otherwise.

**NOTE:** This should not be used for securing pages or resource from a user. Primarily, we use it to hide certain links to
pages that are protected by other means. Use caution when using this page.

### /login-failure

Sends the below object no matter what. This is used as an AJAX request on the login page.

This is accessible by everyone.

This request requires no parameters and returns the following JSON object:

```
{
  success: false
}
```

* `success` always returns false.

This is used as a `failureRedirect` when attempting to log in using PassportJS. This allows the page to display an alert if
the user entered invalid credentials.

### /logout

This logs a user out.

This is accessible by everyone.

This request requires no parameters and redirects a user to the homepage after logging a user out.

### /get-courses

Returns all non-archived courses that registration is still open for.

This is accessible by everyone.

This request requires no parameters and returns a list of courses that are still open for enrollment but are not archived. It
returns a JSON object that looks like this:

```
[
  {
    _id: <ObjectId>,
    name: <string>,
    instructor: <string>,
    instructor_email: <string>,
    instructor_id: <string>,
    room: <string>,
    frequency: {
      start_time: <time>,
      end_time: <time>,
      days_of_week: [ <string>,... ]
    },
    description: <string>,
    type: "Enrichment|Fitness",
    is_archived: <boolean>,
    is_sign_up_able: <boolean>,
    persons_enrolled: [
      {
        first_name: <string>,
        last_name: <string>,
        email: <string>,
        phone: <string>,
        affiliation: "ug-student|g-student|faculty|community",
        payment_method: "cash|credit|check|bursar",
        rin: <string>,
        paid: <string>
      },...
    ],
    semester: {
      term: "Spring|Fall|Summer",
      year: <integer>
    }
  },...
]
```

* `_id` is the ObjectId of the course.
* `name` is the name of the course.
* `instructor` is the name of the instructor teaching the course.
* `instructor_email` is the email of the instructor teaching the course.
* `instructor_id` is the stringified ObjectId of the instructor teaching the course.
* `room` is the room where the class is held.
* `frequency` is the frequency of the class, which has the following attributes:
  * `start_time` is a string of the time that the class starts formatted "hh:mm"
  * `end_time` is a string of the time that the class ends formatted "hh:mm"
  * `days_of_week` is a list of strings that contains the days of the week that the course is offered.
* `description` is a string that has the description of the course.
* `type` is the type of course that is being offered. Valid values are "Fitness" or "Enrichment".
* `is_archived` is true if the course is archived, false otherwise. In this call, is_archived will always be false.
* `is_sign_up_able` is true if the course is still open for registration, and false otherwise. In this call, is_sign_up_able
will always be true.
* `persons_enrolled` is a list of all of the members enrolled in this course.
  * `first_name` is the first name of the person enrolled in the course.
  * `last_name` is the last name of the person enrolled in the course.
  * `email` is the email address of the person enrolled in the course.
  * `phone` is the phone number of the person enrolled in the course.
  * `affiliation` is the affiliation that the person has with the school and / or community.
  * `payment_method` is how the user said they would pay for the course.
  * `rin` is the RIN of the person taking the course if the affiliation is not "community".
  * `paid` is a boolean that is true if the person has paid for the course.
* `semester` is the semester in which the course is offered which has the following values:
  * `term` is the term (Fall, Spring, Summer) that the course is offered.
  * `year` is the year that the course is offered.
  
### /get-nonarchived-courses

Returns a list of all courses that are not archived.

This is accessible by everyone.

This request requires no parameters and returns a list of courses that are not archived. It returns a JSON object that looks
like this:

```
[
  {
    _id: <ObjectId>,
    name: <string>,
    instructor: <string>,
    instructor_email: <string>,
    instructor_id: <string>,
    room: <string>,
    frequency: {
      start_time: <time>,
      end_time: <time>,
      days_of_week: [ <string>,... ]
    },
    description: <string>,
    type: "Enrichment|Fitness",
    is_archived: <boolean>,
    is_sign_up_able: <boolean>,
    persons_enrolled: [
      {
        first_name: <string>,
        last_name: <string>,
        email: <string>,
        phone: <string>,
        affiliation: "ug-student|g-student|faculty|community",
        payment_method: "cash|credit|check|bursar",
        rin: <string>,
        paid: <string>
      },...
    ],
    semester: {
      term: "Spring|Fall|Summer",
      year: <integer>
    }
  },...
]
```

* `_id` is the ObjectId of the course.
* `name` is the name of the course.
* `instructor` is the name of the instructor teaching the course.
* `instructor_email` is the email of the instructor teaching the course.
* `instructor_id` is the stringified ObjectId of the instructor teaching the course.
* `room` is the room where the class is held.
* `frequency` is the frequency of the class, which has the following attributes:
  * `start_time` is a string of the time that the class starts formatted "hh:mm"
  * `end_time` is a string of the time that the class ends formatted "hh:mm"
  * `days_of_week` is a list of strings that contains the days of the week that the course is offered.
* `description` is a string that has the description of the course.
* `type` is the type of course that is being offered. Valid values are "Fitness" or "Enrichment".
* `is_archived` is true if the course is archived, false otherwise. In this call, is_archived will always be false.
* `is_sign_up_able` is true if the course is still open for registration, and false otherwise.
* `persons_enrolled` is a list of all of the members enrolled in this course.
  * `first_name` is the first name of the person enrolled in the course.
  * `last_name` is the last name of the person enrolled in the course.
  * `email` is the email address of the person enrolled in the course.
  * `phone` is the phone number of the person enrolled in the course.
  * `affiliation` is the affiliation that the person has with the school and / or community.
  * `payment_method` is how the user said they would pay for the course.
  * `rin` is the RIN of the person taking the course if the affiliation is not "community".
  * `paid` is a boolean that is true if the person has paid for the course.
* `semester` is the semester in which the course is offered which has the following values:
  * `term` is the term (Fall, Spring, Summer) that the course is offered.
  * `year` is the year that the course is offered.
  
The difference between this call and `/get-courses` is that this returns the course whether it's open for registration or not,
whereas the other call returns only courses where is_sign_up_able is true.

### /get-members

Returns a list of all members enrolled in non-archived classes.

This is accessible by adminsitrators.

This request requires no parameters and returns the following JSON list if the user sending the request is an administrator.
The JSON list determines the difference between users by their emails (i.e. a member is unique by email). Otherwise, it
returns an empty JSON object.

```
[
  {
    first_name: <string>,
    last_name: <string>,
    email: <string>,
    phone: <string>,
    affiliation: "ug-student|g-student|faculty|community",
    payment_method: "cash|credit|check|bursar",
    rin: <string>,
    paid: <string>,
    classes: [
      {
        name: <string>,
        _id: <string>
      },...
    ]
  },...
]
```

* `first_name` is the first name of the person enrolled in the course.
* `last_name` is the last name of the person enrolled in the course.
* `email` is the email address of the person enrolled in the course.
* `phone` is the phone number of the person enrolled in the course.
* `affiliation` is the affiliation that the person has with the school and / or community.
* `payment_method` is how the user said they would pay for the course.
* `rin` is the RIN of the person taking the course if the affiliation is not "community".
* `paid` is a boolean that is true if the person has paid for the course.
* `classes` is a list of the classes that the user is taking with the following attributes:
  * `name` is the name of the course the student is enrolled in.
  * `_id` is the stringified ObjectId of the course.

### /get-instructors

Returns a list of instructors.

This is accessible by everyone.

This request requires no parameters and returns a list of all of the instructor objects without the password or salt fields.

```
[
  {
    "_id" : <ObjectId>,
    "email" : <string>,
    "is_admin" : <boolean>,
    "is_instructor" : <boolean>,
    "profile_image" : <string>,
    "first_name" : <string>,
    "last_name" : <string>,
    "biography" : <string>,
    "img_is_flagged" : <boolean>,
    "bio_is_flagged" : <boolean>
  }
]
```

* `_id` is the ObjectId of the instructor.
* `email` is the email address of the instructor.
* `is_admin` is true if the user is an administrator, false otherwise.
* `is_instructor` is true if the user is an instructor, false otherwise. In this call, this attribute will always be true.
* `profile_image` is the URL of the profile image of this instructor (i.e. /resources/img/default.png).
* `first_name` is the first name of the instructor.
* `last_name` is the last name of the instructor.
* `biography` is the biography of the instructor.
* `img_is_flagged` is true if the instructor's image is flagged by an administrator, false otherwise.
* `bio_is_flagged` is true if the instructor's bio is flagged by an administrator, false otherwise.

### /get-admins

Returns a list of administrators.

This is accessible by administrators.

This request requires no parameters and returns a list of all admin objects without the password or salt fields.

```
[
  {
    "_id" : <ObjectId>,
    "email" : <string>,
    "is_admin" : <boolean>,
    "is_instructor" : <boolean>,
    "profile_image" : <string>,
    "first_name" : <string>,
    "last_name" : <string>,
    "biography" : <string>,
    "img_is_flagged" : <boolean>,
    "bio_is_flagged" : <boolean>
  }
]
```

* `_id` is the ObjectId of the user.
* `email` is the email address of the user.
* `is_admin` is true if the user is an administrator, false otherwise. In this call, this attribute will always be true.
* `is_instructor` is true if the user is an instructor, false otherwise.
* `profile_image` is the URL of the profile image of this user (i.e. /resources/img/default.png).
* `first_name` is the first name of the user.
* `last_name` is the last name of the user.
* `biography` is the biography of the user.
* `img_is_flagged` is true if the user's image is flagged by an administrator, false otherwise.
* `bio_is_flagged` is true if the user's bio is flagged by an administrator, false otherwise.

### /get-account-info

Returns the account information of the currently logged in user.

This is accessible by any logged in user.

This request requires no parameters and returns a JSON object with all of the account information for the currently logged in
user without the password and salt fields. If the user is not logged in, an empty JSON object is returned.

```
{
  "_id" : <ObjectId>,
  "email" : <string>,
  "is_admin" : <boolean>,
  "is_instructor" : <boolean>,
  "profile_image" : <string>,
  "first_name" : <string>,
  "last_name" : <string>,
  "biography" : <string>,
  "img_is_flagged" : <boolean>,
  "bio_is_flagged" : <boolean>
}
```

* `_id` is the ObjectId of the user.
* `email` is the email address of the user.
* `is_admin` is true if the user is an administrator, false otherwise.
* `is_instructor` is true if the user is an instructor, false otherwise.
* `profile_image` is the URL of the profile image of this user (i.e. /resources/img/default.png).
* `first_name` is the first name of the user.
* `last_name` is the last name of the user.
* `biography` is the biography of the user.
* `img_is_flagged` is true if the user's image is flagged by an administrator, false otherwise.
* `bio_is_flagged` is true if the user's bio is flagged by an administrator, false otherwise.

## POST Requests

### /enroll

Enrolls a user in the course.

This is accessible by everyone.

This request requires the following parameters:

```
{
  person: {
    first_name: <string>,
    last_name: <string>,
    email: <string>,
    phone: <string>,
    affiliation: "ug-student|g-student|faculty|community",
    payment_method: "cash|credit|check|bursar",
    rin: <string>,
    paid: <string>
  },
  course: {
    _id: <ObjectId>,
    name: <string>,
    instructor: <string>,
    instructor_email: <string>,
    instructor_id: <string>,
    room: <string>,
    frequency: {
      start_time: <time>,
      end_time: <time>,
      days_of_week: [ <string>,... ]
    },
    description: <string>,
    type: "Enrichment|Fitness",
    is_archived: <boolean>,
    is_sign_up_able: <boolean>,
    persons_enrolled: [
      {
        first_name: <string>,
        last_name: <string>,
        email: <string>,
        phone: <string>,
        affiliation: "ug-student|g-student|faculty|community",
        payment_method: "cash|credit|check|bursar",
        rin: <string>,
        paid: <string>
      },...
    ],
    semester: {
      term: "Spring|Fall|Summer",
      year: <integer>
    }
  }
}
```

* `person` is a then person we are trying to enroll in the course.
  * `first_name` is the first name of the person enrolled in the course.
  * `last_name` is the last name of the person enrolled in the course.
  * `email` is the email address of the person enrolled in the course.
  * `phone` is the phone number of the person enrolled in the course.
  * `affiliation` is the affiliation that the person has with the school and / or community.
  * `payment_method` is how the user said they would pay for the course.
  * `rin` is the RIN of the person taking the course if the affiliation is not "community".
  * `paid` is a boolean that is true if the person has paid for the course.
* `course` is the course object that we are trying to enroll the user in:
  * `_id` is the ObjectId of the course.
  * `name` is the name of the course.
  * `instructor` is the name of the instructor teaching the course.
  * `instructor_email` is the email of the instructor teaching the course.
  * `instructor_id` is the stringified ObjectId of the instructor teaching the course.
  * `room` is the room where the class is held.
  * `frequency` is the frequency of the class, which has the following attributes:
    * `start_time` is a string of the time that the class starts formatted "hh:mm"
    * `end_time` is a string of the time that the class ends formatted "hh:mm"
    * `days_of_week` is a list of strings that contains the days of the week that the course is offered.
  * `description` is a string that has the description of the course.
  * `type` is the type of course that is being offered. Valid values are "Fitness" or "Enrichment".
  * `is_archived` is true if the course is archived, false otherwise. In this call, is_archived will always be false.
  * `is_sign_up_able` is true if the course is still open for registration, and false otherwise. In this call, is_sign_up_able
  will always be true.
  * `semester` is the semester in which the course is offered which has the following values:
    * `term` is the term (Fall, Spring, Summer) that the course is offered.
    * `year` is the year that the course is offered.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the person was enrolled, false otherwise. Often, a user is not enrolled if that email address is
already enrolled in the course.

### /email-class

Emails a class a specified message.

This is accessible by instructors.

This request requires the following parameters:

```
{
  class_id: <string>,
  class_name: <string>,
  subject: <string>,
  body: <string>
}
```

* `class_id` is the stringified ObjectId of the class we are emailing.
* `class_name` is the name of the class that we are emailing.
* `subject` is the subject of the email.
* `body` is the body of the email. This can be HTML formatted with all styles inline.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the email sending was successful, false otherwise. Success will be false and the email will not be 
sent if the user is not an instructor.

### /email/ind

Emails a specified individual.

This is accessible by administrators.

This request requires the following parameters:

```
{
  email: <string>,
  subject: <string>,
  message: <string>
}
```

* `email` is the email address to send the email to.
* `subject` is the subject of the email.
* `message` is the body off the email. This can be HTML formatted with all styles inline.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the email sending was successful, false otherwise. Success will be false and the email will not be 
sent if the user is not an administrator.

### /login

Logs a user in.

This is accessible by everyone.

This request authenticates the user and redirects to `/account` if successful, and redirects to `/login-failure` if
unsuccessful.

### /add-class

Adds a new course.

This is accessible by administrators.

This request requires the following parameters:

```
{
  name: <string>,
  instructor: <string>,
  room: <string>,
  frequency: {
    start_time: <time>,
    end_time: <time>,
    days_of_week: [ <string>,... ]
  },
  description: <string>,
  type: "Enrichment|Fitness",
  is_archived: <boolean>,
  is_sign_up_able: <boolean>,
  persons_enrolled: [],
  semester: {
    term: "Spring|Summer|Fall",
    year: <integer>
  }
}
```

* `name` is the name of the course.
* `instructor` is the stringified ObjectId of the instructor teaching the course.
* `room` is the room where the class is held.
* `frequency` is the frequency of the class, which has the following attributes:
  * `start_time` is a string of the time that the class starts formatted "hh:mm"
  * `end_time` is a string of the time that the class ends formatted "hh:mm"
  * `days_of_week` is a list of strings that contains the days of the week that the course is offered.
* `description` is a string that has the description of the course.
* `type` is the type of course that is being offered. Valid values are "Fitness" or "Enrichment".
* `is_archived` is true if the course is archived, false otherwise.
* `is_sign_up_able` is true if the course is still open for registration, and false otherwise.
* `semester` is the semester in which the course is offered which has the following values:
  * `term` is the term (Fall, Spring, Summer) that the course is offered.
  * `year` is the year that the course is offered.
* `persons_enrolled` must be an empty list. Otherwise, the entire website will have undefined behavior.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the class was successfully created, false otherwise. Success is false and the course is not created
if the user is not an administrator.

### /delete-course

Deletes a course.

This is accessible by administrators.

This request requires the following parameters:

```
{
  course: <string>
}
```

* `course` is the stringified ObjectId of the course we are deleting.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the class was successfully deleted, false otherwise. Success is false and the course is not deleted
if the user is not an administrator.

### /archive-course

Archives a course.

This is accessible by administrators.

This request requires the following parameters:

```
{
  "course": <string>
}
```

* `course` is the stringified ObjectId of the course we are archiving.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the class was successfully archived, false otherwise. Success is false and the course is not archived
if the user is not an administrator.

### /edit-course

Modifies a course's information.

This is accessible by administrators.

This request requires the following parameters:

```
{
  course: <string>,
  update: {
    <key>: <value>
  }
}
```

* `course` is the stringified ObjectId of the course we are updating.
* `update` is an object where <key> is the attribute of the course being updated and <value> is the value we are changing
it to.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the class was successfully modified, false otherwise. Success is false and the course is not modified
if the user is not an administrator.

### /delete-member

Deletes a member from all courses he/she is currently enrolled in.

This is accessible by administrators.

This request requires the following object:

```
{
  email: <string>
}
```

* `email` is the email of the member we are deleting.

This request returns an empty JSON object. It removes a person with the given email address from all courses that this member
is enrolled in if the sender is an administrator.

### /remove-member

Removes a member from a single class.

This is accessible by administrators.

This request requires the following object:

```
{
  course: <string>,
  email: <string>
}
```

* `course` is the stringified ObjectId of the course that we are removing.
* `email` is the email of the person we are removing from the course.

This request returns an empty object. It removes a single person from a single class if the sender is an administrator.

### /change-member

Updates a member's payment status and / or method.

This is accessible by administrators.

This request requires the following object:

```
{
  email: <string>,
  method: "true|false",
  paid: "true|false"
}
```

This request returns an empty object. It changes the specified user's payment method and payment status to the specified
values for the person with the specified email address in all places that user shows up.

### /add-account

Creates a new account for an instructor or administrator.

This is accessible by administrators.

This request requires the following object:

```
{
  fname: <string>,
  lname: <string>,
  email: <string>,
  is_admin: <string>,
  is_instructor: <string>
}
```

If this request is successful, the user is redirected to the admin panel. Otherwise, the user is redirected home.

This generates a new account with a random password to the specified email. The instructor is notified via email about the
creation of the account.

### /delete-account

Deletes an account.

This is accessible by administrators.

This request requires the following object:

```
{
  email: <string>
}
```

* `email` is the email of the account we are deleting.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the deletion was successful, false otherwise. If the user is not an administrator, the request is
denied.

### /update-info

Update the information of the currently logged in user.

This is only accessible to users that are logged in.

This request requires the following object:

```
{
  fname: <string>,
  lname: <string>,
  biography: <string>
}
```

* `fname` is what we are changing the first name of the user to.
* `lname` is what we are changing the last name of the user to.
* `biography` is what we are changing the biography to.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the user was updated, false otherwise.

### /change-password

Change the password of the currently logged in user.

This is only accessible to users that are logged in.

This request requires the following object:

```
{
  oldpass: <string>,
  newpass: <string>
}
```

* `oldpass` is the string of the old password of the user.
* `newpass` is the new password that the user is trying to change it to.

This request returns the following object:

```
{
  success: <boolean>
}
```

* `success` is true if the user's password was changed successfully. If the old password was incorrect, then the password
is unchanged and returns false.

### /change-image

Changes the profile image of the currently logged in user.

This is only accessible to users that are logged in.

This request requires the following files:

```
newimage
```

* `newimage` is the image that we are uploading

This request returns nothing but redirects the user to the account page upon success, and redirects the user to the home page
upon failure.

### /flag-bio

Flags the specified user's bio.

This is only accessible to users that are administrators.

This request requires the following object:

```
{
  email: <string>
}
```

* `email` is the email of the user that we are flagging the bio of.

This request returns nothing.

### /flag-img

Flags the specified user's image.

This is only accessible to users that are administrators.

This request requires the following object:

```
{
  email: <string>
}
```

* `email` is the email of the user that we are flagging the image of.

This request returns nothing.

### /unflag-bio

Unflags the specified user's bio.

This is only accessible to users that are administrators.

This request requires the following object:

```
{
  email: <string>
}
```

* `email` is the email of the user that we are unflagging the bio of.

This request returns nothing.

### /unflag-img

Unflags the specified user's image.

This is only accessible to users that are administrators.

This request requires the following object:

```
{
  email: <string>
}
```

* `email` is the email of the user that we are unflagging the image of.

This request returns nothing.