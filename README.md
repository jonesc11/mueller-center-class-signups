# Mueller Center Class Sign-ups

The focus of this project is to streamline the process of signing up for classes through the Mueller Center. As it stands now, the Mueller Center has a generally disorganized and paper-based system that could be greatly improved upon. Our solution would provide mechanisms for people to sign up for classes online, for instructors to email out the members in their classes directly, and for administrators to add and update classes and payment statuses. The ultimate goal is for this project to eventually be turned over to the Mueller Center for integration. More details are provided in the writeup located in the documents folder of this repository.

## Project Contributers

* Collin Jones is a junior Information Technology & Web Science (ITWS) and Computer Science dual major with a concentration in Web Technologies. His primary role was as a Backend Developer.

* Jason Lee is a junior Computer Science and ITWS dual major with a concentration in Web Technologies. His focus was on the interaction between the project’s frontend and backend.

* Yarden Ne’eman is a senior Computer Science and ITWS dual major with a concentration in Web Technologies. Yarden served as the Project Manager and Frontend Developer.

* Sydney Ruzicka is a junior ITWS and Business Management dual major. Her main role in the project was as a Frontend Developer.

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
