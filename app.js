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

app.get ('/', function (req, res) {
  res.sendFile (__dirname + "/pages/index.html");
});

app.get ('/instructors', function (req, res) {
  res.sendFile (__dirname + "/pages/instructor_list.html");
});

app.get ('/admin', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result)
      res.sendFile (__dirname + "/pages/admin.html");
    else
      res.redirect ('/');
  });
});

app.get ('/instructor', function (req, res) {
  userIsInstructor (req.user ? req.user : '').then (function (result) {
    if (result)
      res.sendFile (__dirname + "/pages/instructor.html");
    else
      userIsAdmin (req.user ? req.user : '').then (function (result) {
        if (result)
          res.sendFile (__dirname + '/pages/instructor.html');
        else
          res.redirect ('/');
      });
  });
});

app.post ('/email/class', function (req, res) {
  var classObject = getClass (req.body.class_id);
  for (var i = 0; i < classObject.persons_enrolled; ++i) {
    var person = classObject.persons_enrolled[i];

    sendEmail (classObject.persons_enrolled[i].email_address, req.body.subject, req.body.body);
  }
});

app.get ('/login', function (req, res) {
  if (req.user)
    res.redirect ('/instructor');
  else
    res.sendFile (__dirname + "/pages/login.html");
});

app.post ('/login',
  passport.authenticate('local', { successRedirect: '/instructor',
                                   failureRedirect: '/login' }));

app.get ('/logout',function(req,res) {
  req.logout();
  res.redirect('/');
});

app.post ('/register',
  passport.authenticate('local-register', { successRedirect: '/',
                                   failureRedirect: '/login' }));

app.get ('/get-courses', function (req, res) {
  getAllSignUpableCourses().then(function (data) { res.send (data); });
});

app.get ('/get-instructors', function (req, res) {
  getAllInstructors().then(function (data) { res.send (data); });
});

app.get ('/get-account-info', function (req, res) {
  getUserByEmail (req.user ? req.user : '').then (function (result) {
    if (result) {
      res.send(result);
    } else {
      res.send ({});
    }
  });
});

app.post ('/add-account', function (req, res) {
  userIsAdmin (req.user ? req.user : '').then (function (result) {
    if (result) {
      genNewAccount (req.body.fname, req.body.lname, req.body.email);
      res.redirect ('/admin');
    } else {
      res.redirect ('/');
    }
  });
});

app.post ('/update-info', function (req, res) {
  if (req.user) {
    updateUserByEmail (req.user, {
      first_name: req.body.fname,
      last_name: req.body.lname,
      biography: req.body.biography
    });
    res.redirect ('/instructor');
  } else {
    res.redirect ('/');
  }
});

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
        res.redirect ('/instructor');
      });
    }
  } else {
    res.redirect ('/');
  }
});

var mongoUrl = 'mongodb://ec2-34-239-101-4.compute-1.amazonaws.com';

mongo.connect (mongoUrl, function (err, client) {
  if (err) {
    console.log (err);
    return;
  }
  
  var db = client.db('muellerfitness');
  
  accountsCollection = db.collection ('accounts');
  classesCollection = db.collection ('classes');
});

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

function genNewAccount (fname, lname, email) {
  var password = '';
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (var i = 0; i < 8; ++i)
    password += chars.charAt(Math.floor(Math.random() * chars.length));

  email = email.toLowerCase();

  var newUser = {
    email: email,
    is_admin: false,
    is_instructor: true,
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
  return classesCollection.findOne ({ _id: new ObjectId(objectId) });
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
    } else {
      courses[i].instructor = "";
      courses[i].instructor_email = "";
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
    } else {
      courses[i].instructor = "";
      courses[i].instructor_email = "";
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
 * Returns all member objects unique on email address
 */
async function getAllMembers () {
  var courses = getAllCourses ();
  var members = [];

  for (var i = 0; i < courses.length; ++i) {
    for (var j = 0; j < courses[i].persons_enrolled.length; ++j) {
      var inArray = false;
      for (var k = 0; k < members.length; ++k)
        if (members[i].email_address.toLowerCase() === courses[i].persons_enrolled[j].email_address.toLowerCase()) {
          inArray = true;
          break;
        }
      if (!inArray)
        members.push (courses[i].persons_enrolled[j]);
    }
  }

  return members;
}

/**
 * Updates a specified class object
 * objectId is the ObjectId of the course we are trying to update
 * updateObject is the key-value pairs of objects we are updating
 *   i.e. if we are updating the course description, updateObject
 *    would be { description: "new description" }
 */
async function updateClassObject (objectId, updateObject) {
  classesCollection.updateOne ({ _id: new ObjectId(objectId) }, { $set: updateObject });
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
async function createClass (name, year, term, description, type) {
  if (!(term === "Spring" || term === "Summer" || term === "Fall"))
    return -1;
  var object = {
    name: name,
    semester: {
      year: year,
      term: term
    },
    description: description,
    type: type
  };

  return await classesCollection.insertOne (object);
}

/**
 * Adds a session to the specified course. Returns 1 on success, 0 on failure, -1 on bad input.
 * objectId is the ObjectId of the course we are adding the session to
 * startDate is the start date of the session we are adding
 * endDate is the end date of the session we are adding
 * instructor is the ObjectId of the session's instructor
 * sessionId is an ID for the session. It must be unique within the class.
 * room is the room that the class is taught in
 * fDaysOfWeek is the days of the week that the course is offered
 * fStartTime is the start time of the class
 * fEndTime is the end time of the class
 */
async function addSession (objectId, startDate, endDate, instructor, sessionId, room, fDaysOfWeek, fStartTime, fEndTime) {
  var currentObject = classesCollection.findOne({ _id: objectId });
  if (currentObject === undefined || currentObject === null)
    return -1;
  if (currentObject.sessions)
    for (var i = 0; i < currentObject.sessions.length; ++i)
      if (currentObject.sessions[i].session_id == sessionId)
        return -1;

  var update = {
    start_date: startDate,
    end_date: endDate,
    frequency: {
      days_of_week: fDaysOfWeek,
      start_time: fStartTime,
      end_time: fEndTime
    },
    instructor: instructor,
    session_id: sessionId,
    room: room
  };

  return await classesCollection.updateOne ({ _id: objectId }, { $push: update });
}

/**
 * Adds a user to a specified course
 * objectId is the ObjectId of the class that we are adding the person to
 * emailAddress is the email address of the user that we are adding to the class
 * fullName is the full name of the user that we are adding to the class
 * paymentMethod is the payment method that the user we are adding is using
 * paid is whether or not the person we are adding has paid
 */
async function addMember (objectId, emailAddress, fullName, paymentMethod, paid) {
  var toAdd = {
    email_address: emailAddress.toLowerCase(),
    name: fullName,
    payment_method: paymentMethod,
    paid: paid
  };

  accountsCollection.updateOne ({ _id: new ObjectId(objectId) }, { $push: { enrolled_persons: toAdd } });
}

/**
 * Removes a user to a specified course
 * objectId is the ObjectId of the class that we are removing the person from
 * emailAddress is the email address of the user that we are removing from the class
 */
async function removeMember (objectId, emailAddress) {
  accountsCollection.updateOne ({ _id: new ObjectId(objectId) }, { $pull: { enrolled_persons: { email_address: emailAddress.toLowerCase() } } });
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

  return await classesCollection.updateOne ({ _id: objectId }, { $push: update });
}

/**
 * Deletes a course from the database.
 * objectId is the ObjectId of the course to delete.
 */
async function deleteCourse (objectId) {
  classesCollection.deleteOne ({ _id: objectId });
}

/**
 * Sends an email to the given address from the address specified in email_creds.json.
 * recipient is the email of the recipient
 * subject is the subject
 * body is the body of the email (can be formatted as HTML)
 */
function sendEmail (recipient, subject, body) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: email_creds
  });

  transporter.sendMail ({
    from: email_creds.user,
    to: recipient,
    subject: subject,
    html: '<div style="width:100%;height:50px;font-size:30px;background-color:#e2231b;text-align:center;line-height:50px;"><a style="color:white;" href="https://union.rpi.edu/content/mueller-center">Mueller Center Fitness</a></div><div style="padding:16px">' + body + "</div>"
  }, function(error, info) {
    if (error)
      console.log(error);
    else
      console.log('Sent: ' + info);
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
  var queryObject = { _id: new ObjectId(objectId) };
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
    instructors[i].classes = await classesCollection.find({ instructor: instructors[i]._id }).toArray();
    instructors[i].password = undefined;
    instructors[i].salt = undefined;
  }

  return instructors;
}

/**
 * Returns a list of all admins in the database
 */
async function getAllAdmins () {
  return await accountsCollection.find({ is_admin: true }).toArray();
}

/**
 * Updates a user based on an ObjectId.
 * objectId is the ObjectId of the user that we are updating
 * updateObject is the object to send in
 *   i.e. if the update is updating the bio, updateObject would be: { biography: "example bio" }
 */
function updateUserById (objectId, updateObject) {
  accountsCollection.updateOne ({ _id: new ObjectId(objectId) }, { $set: updateObject });
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
 * Deletes a user given an objectId
 */
function deleteUser (objectId) {
  accountsCollection.deleteOne ({ _id: objectId });
}

app.listen(3000, () => console.log('Server listening on port 3000.'));
