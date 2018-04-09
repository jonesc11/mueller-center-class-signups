var path = require ('path');
var express = require ('express');
var app = express();
var mongo = require ('mongodb').MongoClient;
var bcryptjs = require ('bcryptjs');

var accountsCollection = null;
var classesCollection = null;

app.use (express.static (__dirname + '/public'));

app.get ('/', function (req, res) {
  res.sendFile (__dirname + "/pages/index.html");
});

app.get ('/instructors', function (req, res) {
  res.sendFile (__dirname + "/pages/instructor_list.html");
});

app.get ('/admin', function (req, res) {
  res.sendFile (__dirname + "/pages/admin.html");
});

app.get ('/instructor', function (req, res) {
  res.sendFile (__dirname + "/pages/instructor.html");
});

app.get ('/login', function (req, res) {
  res.sendFile (__dirname + "/pages/login.html");
});

var mongoUrl = 'mongodb://ec2-34-239-101-4.compute-1.amazonaws.com';

mongo.connect (mongoUrl, function (err, client) {
  if (err) {
    console.log (err);
    return;
  }
  
  console.log ("Successfully connected to MongoDb server.");
  
  var db = client.db('muellerfitness');
  
  accountsCollection = db.collection ('accounts');
  classesCollection = db.collection ('classes');
  
  console.log ('Successfully created collection objects');
});

/**
 * Returns a class object given an ObjectId
 * objectId is the ObjectId of the class that we are looking for.
 */
async function getClass (objectId) {
  return await coursesCollection.findOne ({ _id: objectId });
}

/**
 * Returns all non-archived class objects
 */
async function getAllCourses () {
  return await coursesCollection.find({ is_archived: { $ne: true } }).toArray();
}

/**
 * Returns all archived class objects
 */
async function getAllArchivedCourses () {
  return await coursesCollection.find({ is_archived: true }).toArray();
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
  coursesCollection.updateOne ({ _id: objectId }, { $set: updateObject });
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

  return await coursesCollection.insertOne (object);
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
  var currentObject = coursesCollection.findOne({ _id: objectId });
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

  return await coursesCollection.updateOne ({ _id: objectId }, { $push: update });
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

  accountsCollection.updateOne ({ _id: objectId }, { $push: { enrolled_persons: toAdd } });
}

/**
 * Removes a user to a specified course
 * objectId is the ObjectId of the class that we are removing the person from
 * emailAddress is the email address of the user that we are removing from the class
 */
async function removeMember (objectId, emailAddress) {
  accountsCollection.updateOne ({ _id: objectId }, { $pull: { enrolled_persons: { email_address: emailAddress.toLowerCase() } } });
}

/**
 * Adds a member to the specified course. Returns 1 on success, 0 on failure, -1 on user already a member of the course or bad input.
 */
async function addEnrollment (objectId, emailAddress, paymentMethod) {
  var currentObject = coursesCollection.findOne({ _id: objectId });
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

  return await coursesCollection.updateOne ({ _id: objectId }, { $push: update });
}

/**
 * Deletes a course from the database.
 * objectId is the ObjectId of the course to delete.
 */
async function deleteCourse (objectId) {
  coursesCollection.deleteOne ({ _id: objectId });
}

/**
 * Returns a randomly generated salt.
 */
function getSalt () {
  return bcrypt.genSaltSync (16);
}

/**
 * Returns a hashed password based on a salt.
 */
function getHashedPassword (passwd, salt) {
  return bcrypt.hashSync (passwd, salt);
}

/**
 * Given an email and password, returns true if the password matches the username in the database
 */
function verifyLogin (email, passwd) {
  var userObject = getUserByEmail (email);
  
  if (user == null)
    return false;
  
  return userObject.password === getHashedPassword (passwd, userObject.salt);
}

/**
 * Returns true if the user is admin, false otherwise.
 * identifier can either be an email address (noted by an '@' symbol) or an ObjectId (from Mongo)
 */
async function userIsAdmin (identifier) {
  var queryObject = {};
  if (identifier.indexOf('@') !== -1) {
    queryObject['email'] = identifier;
  } else {
    queryObject['_id'] = identifier;
  }
  
  var obj = await accountsCollection.findOne (queryObject, {is_admin: 1});
  
  return obj.is_admin;
}

/**
 * Returns true if the instructor is an instructor for the course, false otherwise.
 * instructor is the instructor ObjectId
 * course is the course ObjectId
 */
async function userIsInstructor (instructor, course) {
  var queryObject = { _id: course };
  var queryOptions = { instructors: 1 };
  
  var courseObject = await coursesCollection.findOne (queryObject, queryOptions);
  
  return courseObject.instructors.indexOf (instructor) !== -1;
}

/**
 * Returns true if the instructor's email matches an ObjectId
 * email is the instructor's email
 * objectId is the instructor's ObjectId
 */
async function emailMatchesObject (email, objectId) {
  var queryObject = { _id: objectId };
  var queryOptions = { email: 1 };
  
  var instructorObject = await accountsCollection.findOne (queryObject, queryOptions);
  
  return instructorObject.email = email;
}

/**
 * Returns the account object associated with a specified email address.
 * email is the email address that we are querying for.
 */
async function getUserByEmail (email) {
  var queryObject = { email: email };
  
  return await accountsCollection.findOne ({ email: email });
}

/**
 * Returns the account object associated with a specified object id.
 * objectId is the ObjectId that we are querying for.
 */
async function getUserById (objectId) {
  return await accountsCollection.findOne ({ _id: objectId });
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
  return await accountsCollection.find({ is_instructor: true }).toArray();
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
  accountsCollection.updateOne ({ _id: objectId }, { $set: updateObject });
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
  
  if (getUserByEmail (object.email) !== null)
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
