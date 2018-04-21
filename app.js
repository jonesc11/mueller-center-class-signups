var path = require ('path');
var express = require ('express');
var bodyParser = require('body-parser');
var app = express();
var mongo = require ('mongodb').MongoClient;
var bcryptjs = require ('bcryptjs');
var ObjectID = require('mongodb').ObjectID;
var passport = require ('passport');
var session = require ('express-session');
var LocalStrategy = require ('passport-local').Strategy;
var nodemailer = require ('nodemailer');
var fileUpload = require ('express-fileupload');

var email_creds = require ('./email_creds.json');

app.use (session({
  secret: 'websci-s2018',
  maxAge: null,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));
app.use (passport.initialize ());
app.use (passport.session ());
app.use (fileUpload());

passport.serializeUser (function (user, done) {
  done (null, user);
});
passport.deserializeUser (function (obj, done) {
  done (null, obj);
});

passport.use ('local', new LocalStrategy(
  function (username, password, done) {
    verifyLogin (username, password, function (err, match) {
      if (match) return done (null, username);
      else return done (null, false);
    });
  }
));

passport.use ('local-register', new LocalStrategy(
  { passReqToCallback: true },
  function (req, username, password, done) {
    if (true) {
    // if (password === req.body.passwordConf) { // need to add a registration field with password confirmation
      getHashedPassword (password, getSalt (), function (err, hash) {
        var userObject = { email: username, password: hash, is_admin: false };
        var signupAttempt = createUser (userObject).then (function (result) {
          if (result !== 0 && result !== -1)
            return done (null, userObject);
          else return done (null, false);
        });
      });
    }
    else return done (null, false);
  }
));

var accountsCollection = null;
var classesCollection = null;

app.use (bodyParser.json ());
app.use (bodyParser.urlencoded ( {extended: true} ));

app.use (express.static (__dirname + '/public'));

//Returns index.html when a user requests the main page
app.get ('/', function (req, res) {
  res.sendFile (__dirname + "/pages/index.html");
});

//Returns index.html when a user requests the instructor page
app.get ('/instructors', function (req, res) {
  res.sendFile (__dirname + "/pages/instructor_list.html");
});

//Returns the admin panel if the user is an admin
app.get ('/admin', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result)
      res.sendFile (__dirname + "/pages/admin.html");
    else
      res.redirect ('/');
  });
});

//Returns the account page if the user is an admin or instructor
app.get ('/account', function (req, res) {
  userIsInstructor (req.user ? req.user : '').then (function (result) {
    if (result)
      res.sendFile (__dirname + "/pages/account.html");
    else
      userIsAdmin (req.user ? req.user : '').then (function (result) {
        if (result)
          res.sendFile (__dirname + '/pages/account.html');
        else
          res.redirect ('/');
      });
  });
});

//Function to enroll a user in a class
app.post ('/enroll', function (req, res) {
  //Call to add member to this class
  addMember (req.body.course.course_id, req.body.person);
  
  //Create an email and send it to the user confirming they signed up for the class
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: email_creds
  });
  
  transporter.sendMail ({
    from: email_creds.user,
    to: req.body.person.email,
    subject: 'You have signed up for ' + req.body.course.course_name + ' at Mueller Center Fitness!',
    html: '<div style="width:100%;height:50px;font-size:30px;background-color:#e2231b;text-align:center;line-height:50px;"><a style="color:white;" href="https://union.rpi.edu/content/mueller-center">Mueller Center Fitness</a></div><div style="padding:16px"><h1 align="center">You have signed up for ' +  req.body.course.course_name +' at Mueller Center Fitness!</h1><h3 style="margin-bottom:0">Class details:</h3><div>Instructor: ' + req.body.course.instructor + '<br/>Days: ' + req.body.course.days +'<br/>Time: ' + req.body.course.time +'<br/>Room: ' + req.body.course.room +'</div><p>If you are paying with a check, please bring it to the Mueller Center. If you are paying with cash or card, please bring it to the Union Administration Office. You have three weeks from the beginning of classes to request a full refund.</p><p>If you wish to be removed from this class, please email Donna Sutton at <a href="mailto:suttoa@rpi.edu">suttoa@rpi.edu</a> with your name, RIN (if applicable), and the class you wish to be removed from.</p><div align="center"><img style="width:200px;" src="https://poly.rpi.edu/wp-content/uploads/2018/03/Union-Logo-Design-WebLeveled.jpg"><br/>Contact the Mueller Center at: (518)-276-2874</div>'
  }, function (err, info) {
    if (err)
      throw err;
  });
  res.send ({success: true});
});

//Function to email an entire class
app.post ('/email-class', function (req, res) {
  userIsInstructor (req.user ? req.user : '').then (function (result) {
    if (result) {
      getClass (req.body.class_id).then (function (response) {
        for (var i = 0; i < response.persons_enrolled.length; ++i) {
          var person = response.persons_enrolled[i];
          sendEmail (person.email, req.body.subject, req.body.body, req.body.class_name);
        }
        res.send ({ success: true});
      });
    } else {
      res.send ({success: false});
    }
  });
});

//Function to email an individual user
app.post ('/email/ind', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (response) {
    if (response) {
      sendEmail (req.body.email, req.body.subject, req.body.message, "Mueller Center Admin");
      res.send ({ success: true });
    } else {
      res.send ({ success: false });
    }
  });
});

//Returns the login page if this is a valid user
app.get ('/login', function (req, res) {
  if (req.user)
    res.redirect ('/account');
  else
    res.sendFile (__dirname + "/pages/login.html");
});

//Checks if the user is an admin
app.get ('/is-admin', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (response) {
    if (response)
      res.send ({ is_admin: true });
    else
      res.send ({ is_admin: false });
  });
});

//Checks if the user is an instructor
app.get ('/is-instructor', function (req, res) {
  userIsInstructor (req.user ? req.user : '').then (function (response) {
    if (response)
      res.send ({ is_instructor: true });
    else
      res.send ({ is_instructor: false });
  });
});

//Function to login
app.post ('/login',
  passport.authenticate('local', { successRedirect: '/account',
                                   failureRedirect: '/login' }));

//Function to log out
app.get ('/logout',function(req,res) {
  req.logout();
  res.redirect('/');
});

//Function to register a new user
app.post ('/register',
  passport.authenticate('local-register', { successRedirect: '/',
                                   failureRedirect: '/login' }));

//Function to get all courses that are open for registration
app.get ('/get-courses', function (req, res) {
  getAllSignUpableCourses().then(function (data) { res.send (data); });
});

//Function to get all courses that are open for registration
app.get ('/get-nonarchived-courses', function (req, res) {
  getAllNonArchivedCourses().then(function (data) { res.send (data); });
});

//Function to add a new class
app.post ('/add-class', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      createClass (req.body);
      res.send ({ success: true });
    } else {
      res.send ({ success: false });
    }
  });
});

//Function to delete a class
app.post ('/delete-course', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      deleteCourse (req.body.course);
      res.send ({ success: true });
    } else {
      res.send ({ success: false });
    }
  });
});

//Function to archive a class
app.post ('/archive-course', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      updateClassObject (req.body.course, { is_archived: true, is_sign_up_able: false });
      res.send ({});
    } else {
      res.send ({});
    }
  });
});

//Function to edit a class
app.post ('/edit-course', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      updateClassObject (req.body.course, req.body.update);
      res.send ({ success: true });
    } else {
      res.send ({ success: false });
    }
  });
});

//Function to return the members of a class
app.get ('/get-members', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      getAllMembers ().then (function (response) {
        res.send (response);
      });
    } else {
      res.send ({});
    }
  });
});

//Function to delete a member
app.post ('/delete-member', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      deleteMember (req.body.email);
      res.send ({});
    } else {
      res.send ({});
    }
  });
});

//Function to remove a member from a class
app.post ('/remove-member', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      removeMember (req.body.course, req.body.email);
      res.send ({});
    } else {
      res.send ({});
    }
  });
});

//Function to change the payment method or status for a member
app.post ('/change-member', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      changeMemberPayment (req.body.email, { payment_method: req.body.method, paid: req.body.paid });
      res.send ({});
    } else {
      res.send ({});
    }
  });
});

//Function to return all instructors
app.get ('/get-instructors', function (req, res) {
  getAllInstructors().then(function (data) { res.send (data); });
});

//Function to return all admins
app.get ('/get-admins', function (req, res) {
  getAllAdmins().then (function (data) {res.send (data); });
});

//Function to get this user's account information
app.get ('/get-account-info', function (req, res) {
  getUserByEmail (req.user ? req.user : '').then (function (result) {
    if (result) {
      res.send(result);
    } else {
      res.send ({});
    }
  });
});

//Function to create a new admin or instructor account
app.post ('/add-account', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      genNewAccount (req.body.fname, req.body.lname, req.body.email, req.body.is_admin, req.body.is_instructor);
      res.redirect ('/admin');
    } else {
      res.redirect ('/');
    }
  });
});

app.post ('/delete-account', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      deleteUser (req.body.email);
      res.send ({ success: true });
    } else {
      res.send ({ success: false });
    }
  });
});

//Function to update an account's information
app.post ('/update-info', function (req, res) {
  if (req.user) {
    updateUserByEmail (req.user, {
      first_name: req.body.fname,
      last_name: req.body.lname,
      biography: req.body.biography
    });
    res.redirect ('/account');
  } else {
    res.redirect ('/');
  }
});

//Function to change the account's password
app.post ('/change-password', function (req, res) {
  if (req.user) {
    if (changePassword (req.user, req.body.oldpass, req.body.newpass))
      res.send ({ success: true });
    else
      res.send ({ success: false });
  } else {
    res.redirect ('/');
  }
});

//Function to change the account's image
app.post ('/change-image', function (req, res) {
  if (req.user) {
    if (req.files && req.files.newimage) {
      var file = req.files.newimage;
      file.mv (__dirname + '/public/resources/img/' + req.user + file.name.substring (file.name.lastIndexOf ('.')), function (err) {
        if (err)
          throw err;
        updateUserByEmail (req.user, {
          profile_image: '/resources/img/' + req.user + file.name.substring (file.name.lastIndexOf ('.'))
        });
        res.redirect ('/account');
      });
    }
  } else {
    res.redirect ('/');
  }
});

//Function to flag an instructor bio
app.post ('/flag-bio', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      updateUserByEmail (req.body.email, { bio_is_flagged: true });
    } else {
      res.redirect ('/');
    }
  });
});

//Function to flag an instructor image
app.post ('/flag-img', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      updateUserByEmail (req.body.email, { img_is_flagged: true });
    } else {
      res.redirect ('/');
    }
  });
});

//Function to unflag a bio
app.post ('/unflag-bio', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      updateUserByEmail (req.body.email, { bio_is_flagged: false });
    } else {
      res.redirect ('/');
    }
  });
});

//Function to unflag an image
app.post ('/unflag-img', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      updateUserByEmail (req.body.email, { img_is_flagged: false });
    } else {
      res.redirect ('/');
    }
  });
});

//URL for mongo database
var mongoUrl = 'mongodb://ec2-34-239-101-4.compute-1.amazonaws.com';

//Connect to the database
mongo.connect (mongoUrl, function (err, client) {
  if (err) {
    console.log (err);
    return;
  }
  
  var db = client.db('muellerfitness');
  
  accountsCollection = db.collection ('accounts');
  classesCollection = db.collection ('classes');
});

//Function to change the password for an account
async function changePassword (email, oldpass, newpass) {
  var user = await getUserByEmail (email);
  getHashedPassword (oldpass, user.salt, function (err, hash) {
    if (user.password == hash) {
      getHashedPassword (newpass, user.salt, function (err, newhash) {
        updateUserByEmail (email, { password: newhash });
        return true;
      });
    } else {
      return false;
    }
  });
}

//Function to create a new account and generate a temporary password
function genNewAccount (fname, lname, email, admin, instructor) {
  var password = '';
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (var i = 0; i < 8; ++i)
    password += chars.charAt(Math.floor(Math.random() * chars.length));

  email = email.toLowerCase();

  var newUser = {
    email: email,
    is_admin: admin,
    is_instructor: instructor,
    profile_image: '/resources/img/default.png',
    first_name: fname,
    last_name: lname,
    biography: 'No biography.',
    img_is_flagged: false,
    bio_is_flagged: false
  };

  newUser.salt = getSalt();
  getHashedPassword (password, newUser.salt, function (err, hash) {
    newUser.password = hash;
    createUser (newUser);
  });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: email_creds
  });

  //Email this user their new account information
  transporter.sendMail ({
    from: email_creds.user,
    to: email,
    subject: 'You have been given an account for Mueller Center Fitness!',
    html: '<div style="width:100%;height:50px;font-size:30px;background-color:#e2231b;text-align:center;line-height:50px;"><a style="color:white;" href="https://union.rpi.edu/content/mueller-center">Mueller Center Fitness</a></div><div style="padding:16px">You have been given an account at Mueller Center Fitness! Login <a href="http://localhost:3000/login">here</a> with the following credentials:<br/>Username: ' + email + '<br/>Password: ' + password + '</div>'
  }, function (err, info) {
    if (err)
      throw err;
  });
}

/**
 * Returns a class object given an ObjectId
 * objectId is the ObjectId of the class that we are looking for.
 */
async function getClass (objectId) {
  return classesCollection.findOne ({ _id: new ObjectID(objectId) });
}

/**
 * Returns all non-archived class objects
 */
async function getAllCourses () {
  var courses = classesCollection.find({ is_archived: { $ne: true } }).toArray();

  for (var i = 0; i < courses.length; ++i) {
    var instructor = getUserById (courses[i].instructor); 
    if (instructor && instructor !== null) {
      courses[i].instructor = instructor.first_name + " " + instructor.last_name;
      courses[i].instructor_email = instructor.email;
      courses[i].instructor_id = instructor._id.toString();
    } else {
      courses[i].instructor = "";
      courses[i].instructor_email = "";
      courses[i].instructor_id = "";
    }
  }

  return courses;
}

/**
 * Returns all courses that are signupable
 */
async function getAllSignUpableCourses () {
  var courses = await classesCollection.find({ is_archived: { $ne: true }, is_sign_up_able: true }).toArray();

  for (var i = 0; i < courses.length; ++i) {
    var instructor = await getUserById (courses[i].instructor);
    if (instructor && instructor !== null) {
      courses[i].instructor = instructor.first_name + " " + instructor.last_name;
      courses[i].instructor_email = instructor.email;
      courses[i].instructor_id = instructor._id.toString();
    } else {
      courses[i].instructor = "";
      courses[i].instructor_email = "";
      courses[i].instructor_id = "";
    }
  }

  return courses;
}

/**
 * Returns all archived class objects
 */
async function getAllArchivedCourses () {
  return await classesCollection.find({ is_archived: true }).toArray();
}

/**
 * Returns all non archived class objects
 */
async function getAllNonArchivedCourses () {
  return await classesCollection.find({ is_archived: false }).toArray();
}

/**
 * Returns all member objects unique on email address
 */
async function getAllMembers () {
  var courses = await getAllCourses ();
  var members = [];

  for (var i = 0; i < courses.length; ++i) {
    for (var j = 0; j < courses[i].persons_enrolled.length; ++j) {
      var inArray = false;
      for (var k = 0; k < members.length; ++k)
        if (members[k].email.toLowerCase() === courses[i].persons_enrolled[j].email.toLowerCase()) {
          inArray = true;
          members[k].classes.push ({
              name: courses[i].name,
              _id: courses[i]._id.toString()
            });
          break;
        }
      if (!inArray) {
        members.push (courses[i].persons_enrolled[j]);
        members[members.length - 1].classes = [
          {
            name: courses[i].name,
            _id: courses[i]._id.toString()
          } ];
      }
    }
  }

  return {members: members};
}

/*
 * Deletes a member from the database and removes them from all of
 * the courses they are enrolled in
 */
async function deleteMember (email) {
  var courses = await getAllCourses ();

  for (var i = 0; i < courses.length; ++i) {
    var newList = [];
    for (var j = 0; j < courses[i].persons_enrolled.length; ++j) {
      if (courses[i].persons_enrolled[j].email.toLowerCase() != email.toLowerCase()) {
        newList.push (courses[i].persons_enrolled[j]);
      }
    }
    updateClassObject (courses[i]._id.toString(), { persons_enrolled: newList });
  }
}

/**
 * Updates a specified class object
 * objectId is the ObjectId of the course we are trying to update
 * updateObject is the key-value pairs of objects we are updating
 *   i.e. if we are updating the course description, updateObject
 *    would be { description: "new description" }
 */
async function updateClassObject (objectId, updateObject) {
  classesCollection.updateOne ({ _id: new ObjectID(objectId) }, { $set: updateObject });
}

/**
 * Inserts a class object into the database
 * name is the name of the course being added
 * year is the year the course is being offered
 * term is the term the course if being offered. If term is not 'Spring',
 *   'Summer', or 'Fall', -1 is returned.
 * description is the course description
 * type is the type of course
 */
async function createClass (object) {
  return await classesCollection.insertOne (object);
}

/**
 * Adds a user to a specified course
 * objectId is the ObjectId of the class that we are adding the person to
 * emailAddress is the email address of the user that we are adding to the class
 * fullName is the full name of the user that we are adding to the class
 * paymentMethod is the payment method that the user we are adding is using
 * paid is whether or not the person we are adding has paid
 */
async function addMember (course, object) {
  await classesCollection.updateOne ({ _id: new ObjectID(course) }, { $push: { persons_enrolled: object } });
}

/*
 * Updates this member's payment method and/or status in all classes they
 * are enrolled in
 */
async function changeMemberPayment (email, paymentData) {
  var courses = await getAllCourses ();
  var members = [];

  for (var i = 0; i < courses.length; ++i) {
    var newArr = [];
    for (var j = 0; j < courses[i].persons_enrolled.length; ++j) {
      if (email.toLowerCase() === courses[i].persons_enrolled[j].email.toLowerCase()) {
        courses[i].persons_enrolled[j].payment_method = paymentData.payment_method;
        courses[i].persons_enrolled[j].paid = paymentData.paid;
      }
      newArr.push (courses[i].persons_enrolled[j]);
    }
    updateClassObject (courses[i]._id.toString(), { persons_enrolled: newArr });
  }
}

/**
 * Removes a user to a specified course
 * objectId is the ObjectId of the class that we are removing the person from
 * emailAddress is the email address of the user that we are removing from the class
 */
async function removeMember (objectId, emailAddress) {
  getClass (objectId).then (function (response) {
    var newArr = [];
    for (var i = 0; i < response.persons_enrolled.length; ++i) {
      if (response.persons_enrolled[i].email.toLowerCase() != emailAddress.toLowerCase())
        newArr.push (response.persons_enrolled[i]);
    }
    updateClassObject (objectId, { persons_enrolled: newArr });
  });
}

/**
 * Adds a member to the specified course. Returns 1 on success, 0 on failure, -1 on user already a member of the course or bad input.
 */
async function addEnrollment (objectId, emailAddress, paymentMethod) {
  var currentObject = classesCollection.findOne({ _id: objectId });
  if (currentObject === undefined || currentObject === null)
    return -1;
  if (currentObject.persons_enrolled)
    for (var i = 0; i < currentObject.persons_enrolled.length; ++i)
      if (currentObject.persons_enrolled[i].email_address === emailAddress.toLowerCase())
        return -1;

  var update = {
    email_address: emailAddress,
    payment_method: paymentMethod,
    paid: false
  };

  return await classesCollection.updateOne ({ _id: new ObjectID(objectId) }, { $push: update });
}

/**
 * Deletes a course from the database.
 * objectId is the ObjectId of the course to delete.
 */
async function deleteCourse (objectId) {
  classesCollection.deleteOne ({ _id: new ObjectID(objectId) });
}

/**
 * Sends an email to the given address from the address specified in email_creds.json.
 * recipient is the email of the recipient
 * subject is the subject
 * body is the body of the email (can be formatted as HTML)
 */
function sendEmail (recipient, subject, body, sender) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: email_creds
  });

  transporter.sendMail ({
    from: email_creds.user,
    to: recipient,
    subject: subject,
    html: '<div style="width:100%;height:50px;font-size:30px;background-color:#e2231b;text-align:center;line-height:50px;"><a style="color:white;" href="https://union.rpi.edu/content/mueller-center">Mueller Center Fitness</a></div><div style="padding:16px"><h2>Email from: ' + sender +'</h2><p>' + body + "</p></div>"
  }, function(error, info) {
    if (error)
      console.log(error);
  });
}

/**
 * Returns a randomly generated salt.
 */
function getSalt () {
  return bcryptjs.genSaltSync (10);
}

/**
 * Returns a hashed password based on a salt.
 */
function getHashedPassword (passwd, salt, done) {
  bcryptjs.hash (passwd, salt, done);
}

/**
 * Given an email and password, returns true if the password matches the username in the database
 */
function verifyLogin (email, passwd, next) {
  getUserByEmail (email).then (function (userObject) {
    if (userObject == null)
      return next (null, false);

    bcryptjs.compare(passwd, userObject.password, function (err, match) {
      if (err) return next (err);
      next (null, match);
    });
  });
}

/**
 * Returns true if the user is admin, false otherwise.
 * identifier can either be an email address (noted by an '@' symbol) or an ObjectId (from Mongo)
 */
async function userIsAdmin (identifier) {
  var obj = await accountsCollection.findOne ({ email: identifier });

  return obj && obj.is_admin ? obj.is_admin : false;
}

/**
 * Returns true if the instructor is an instructor for the course, false otherwise.
 * instructor is the instructor email
 * course is the course ObjectId
 */
async function userIsInstructor (instructor) {
  var obj = await accountsCollection.findOne ({ email: instructor });
  
  return obj && obj.is_instructor ? obj.is_instructor : false;
}

/**
 * Returns true if the instructor's email matches an ObjectId
 * email is the instructor's email
 * objectId is the instructor's ObjectId
 */
async function emailMatchesObject (email, objectId) {
  var queryObject = { _id: new ObjectID(objectId) };
  var queryOptions = { email: 1 };
  
  var instructorObject = await accountsCollection.findOne (queryObject, queryOptions);
  
  return instructorObject.email = email;
}

/**
 * Returns the account object associated with a specified email address.
 * email is the email address that we are querying for.
 */
async function getUserByEmail (email) {
  var user = await accountsCollection.findOne ({ email: email });
  if (user)
    user.classes = await classesCollection.find ({ instructor: user._id.toString() }).toArray();
  
  return user;
}

/**
 * Returns the account object associated with a specified object id.
 * objectId is the ObjectId that we are querying for.
 */
async function getUserById (objectId) {
  return await accountsCollection.findOne ({ _id: new ObjectID(objectId) });
}

/**
 * Returns a list of all users in the database.
 */
async function getAllAccounts () {
  return await accountsCollection.find().toArray();
}

/**
 * Returns a list of all instructors in the database
 */
async function getAllInstructors () {
  var instructors = await accountsCollection.find({ is_instructor: true }).toArray();

  for (var i = 0; i < instructors.length; ++i) {
    instructors[i].classes = await classesCollection.find({ instructor: instructors[i]._id.toString() }).toArray();
    instructors[i].password = undefined;
    instructors[i].salt = undefined;
  }

  return instructors;
}

/**
 * Returns a list of all admins in the database
 */
async function getAllAdmins () {
  var admins = await accountsCollection.find({ is_admin: true }).toArray();

  return admins;
}

/**
 * Updates a user based on an ObjectId.
 * objectId is the ObjectId of the user that we are updating
 * updateObject is the object to send in
 *   i.e. if the update is updating the bio, updateObject would be: { biography: "example bio" }
 */
function updateUserById (objectId, updateObject) {
  accountsCollection.updateOne ({ _id: new ObjectID(objectId) }, { $set: updateObject });
}

/**
 * Updates a user based on an email address
 * email is the email of the user that we are updating
 * updateObject is the object to send in
 *   i.e. if the update is updating the bio, updateObject would be: { biography: "example bio" }
 */
function updateUserByEmail (email, updateObject) {
  accountsCollection.updateOne ({ email: email }, { $set: updateObject });
}

/**
 * Adds a user to the database with the given items
 * object represents the object to insert. Email must be included, otherwise -1 is returned. Also, password must already be hashed.
 * Returns 1 if insertion was successful, 0 if there exists a user with the specified email.
 */
async function createUser (object) {
  if (object.email === undefined)
    return -1;

  object.email = object.email.toLowerCase();
  
  if (await getUserByEmail (object.email) !== null)
    return 0;

  return await accountsCollection.insertOne (object);
}

/**
 * Deletes a user given an email
 */
function deleteUser (email) {
  accountsCollection.deleteOne ({ email: email });
}

app.listen(3000, () => console.log('Server listening on port 3000.'));
