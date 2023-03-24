const path = require('path');
const fs = require('fs');
const usersFilePath = path.join(__dirname, '../data/userDataBase.json');
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function rememberMiddleware (req, res, next) {
    
    if (req.cookies.remember != undefined && req.session.loggedUser == undefined)  { //Here we implement that if the cookie named remember exist (in the controller of users we implement that the user must have checked up the button of remember me), but the req.session has expired (for example, if we close the browser) we assign a variable called loggedUser with the user that signed up before. If loggedUser already exist, nothing of this happend.
        for (let i = 0; i<users.length; i++) {
            if (users[i].email == req.cookies.remember) {
                var loggedUser= users[i]
                req.session.user=loggedUser
                break            
            }
        }
    }
    next()
}

module.exports = rememberMiddleware //We export the function in order of being used as a global middleware in our entry point