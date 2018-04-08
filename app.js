var path = require ('path');
var express = require ('express');
var app = express();
var mongo = require ('mongodb').MongoClient;
var bcryptjs = require ('bcryptjs');
var nodemailer = require ('nodemailer');

var email_creds = require ('./email_creds.json');

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


/*
{
  subject: <string>,
  body: <string>,
  class_id: <string>
}
*/
app.post ('/email/class', function (req, res) {
  var classObject = getClass (req.body.class_id);
  for (var i = 0; i < classObject.persons_enrolled; ++i) {
    var person = classObject.persons_enrolled[i];

    sendEmail (classObject.persons_enrolled[i].email_address, req.body.subject, req.body.body);
  }
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
 * Returns 1 if insertion was successful, 0 otherwise.
 */
async function createUser (object) {
  if (object.email === undefined)
    return -1;
  
  if (getUserByEmail (object.email) !== null)
    return 0;
  
  return await accountsCollection.insertOne (object);
}

app.listen(3000, () => console.log('Server listening on port 3000.'));
