# Mueller Center Class Sign-ups

The focus of this project is to streamline the process of signing up for classes through the Mueller Center. As it stands now, the Mueller Center has a generally disorganized and paper-based system that could be greatly improved upon. Our project would allow 
interested parties to sign up for classes and events online, as well as providing the instructors with an easy way to contact the members of their class. Depending on the viability, we may also extend this to include bursar and credit card payment support.

## Project Contributers

* Collin Jones is a junior Information Technology & Web Science (ITWS) and Computer Science dual major with a concentration in Web Technologies. His primary role will be Backend Developer due to his extensive experience with object-oriented languages and database 
work through internships and other coursework.

* Jason Lee is a junior Computer Science and ITWS dual major with a concentration in Web Technologies. He will be focusing on interaction between the project’s frontend and backend, as well as the editing of project reports.

* Yarden Ne’eman is a senior Computer Science and ITWS dual major with a concentration in Web Technologies. Yarden will serve as the Project Manager for this project due to her prior experience with project management. She will also work on Frontend Development 
for the application due to her previous experience working with frontend technologies.

* Sydney Ruzicka is a junior ITWS and Business Management dual major. Her main role in the project will be Frontend Developer.

* Kamil Szmyd is a senior ITWS major. He will be focusing on the Backend Development. Kamil has experience working on database systems through various projects which will help create a solid backbone for the project at hand.

## Installation

Clone this repository into a directory on a computer with NodeJS installed. In the directory, enter `npm install` install all necessary packages for the application. Create a file called `email_creds.json` with the following contents:

```
{
  user: <string>,
  pass: <string>
}
```

* **user** is the Gmail address that you wish to send all emails from the website from.

* **pass** is the password to that Gmail account.

In the same directory, type `node app.js` to run the server. Finally, connect
to the website at `http://[server ip]:3000`, i.e. `http://localhost:3000`.


## Developer Documentation

All of the developer documentation can be found in the [docs](docs) folder.

* **Endpoint documentation** can be found at [docs/endpoints.md]