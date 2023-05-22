const path = require('path');
const fs = require('fs');
const userMiddleware = require('./localsUser');
const usersFilePath = path.join(__dirname, '../data/userDataBase.json');
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

// This middleware is an app mid, so it's executed in every req, res
function rememberMiddleware (req, res, next) {
    
    if (req.cookies.remember != undefined && req.session.loggedUser == undefined)  { //Here we implement that if the cookie named remember exist (in the controller of users we implement that the user must have checked up the button of remember me), but the req.session has expired (for example, if we close the browser) we assign a variable called loggedUser with the user that signed up before, (obviusly, the cookie must exist and not to be expired). If loggedUser already exist, nothing of this happend.
        for (let i = 0; i<users.length; i++) { //Here we iterates over all the users in DB
            if (users[i].email == req.cookies.remember) { //If a email coincides with the one that the controller sent, the conditional is true and the next steps will be done:
                var loggedUser= users[i] //We asign all the information of the user in this variable
                req.session.user=loggedUser //We asign all the information of the user that is already logged into the global variable session
                break            
            }
        }
    }
    next()
}

module.exports = rememberMiddleware //We export the function in order of being used as a global middleware in our entry point