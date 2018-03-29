var path = require ('path');
var express = require ('express');
var app = express();
var mongo = require ('mongodb').MongoClient;

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
async function getUser (email) {
  var queryObject = { email: email };
  
  var instructorObject = await accountsCollection.findOne (queryObject);
  
  return instructorObject;
}

app.listen(3000, () => console.log('Server listening on port 3000.'));
























