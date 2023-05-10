const path = require('path');
const {validationResult} = require("express-validator"); //We require the results of the validation
const fs = require('fs');
const bcrypt = require('bcrypt');
const usersFilePath = path.join(__dirname, '../data/userDataBase.json');
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
let db = require("../database/models");

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
   login: (req,res) => {
     if (req.session.user) { //If user is logged, we save its information in the req.session.user global variable
          let loggedUser =req.session.user
          let emailName = loggedUser.email.split('@')
          res.redirect("/users/profile/"+ emailName[0]) //As the user is logged, we sent him/her to its profile with his/hers information
     }
     else{
        res.render("login") //If the user is not logged, the view login is rendered
     }
     },

   processLogin: (req, res) =>{

     const resultValidation = validationResult(req); //We save the results of the validation
     //If there are not errors:
     if (resultValidation.isEmpty()) {
          for (let i = 0; i<users.length; i++) {

               if (users[i].email == req.body.email) {  //We search in the database until we match the user that want to login.
                    //If the user is found, we check for the passwords
                    if (bcrypt.compareSync(req.body.password, users[i].password)) {//If the conditional is true(the passwords from the form and the database coincides):
                    var loggedUser= users[i] //Here, the user that was already found is saved in a variable that is added to the req.session.user global variable
                    req.session.user=loggedUser
                    let emailName = loggedUser.email.split('@')
                      //Cookies
                    if(req.body.remember !=undefined){ //If the checkbox is selected (in the form the name of the input was remember)
                    res.cookie("remember",loggedUser.email, {maxAge: 60000}) //We built a cookie named as we want (in this case remember), where into it we save the email of the loggedUser, just the email because the cookies has limited space. The configuration maxAge say how many time the cookie is gonna live (in ms). Later, the email into the cookie is going to be used in a global middleware to keep the user logged
                    }
                    res.redirect("/users/profile/"+ emailName[0])  //Here we send a parametrized route
                    break
                    // Until here the password is correct and the user exists, we get out from the form and the method.
                    }

                    else{//If we arrive until here, the user exists but the password is not correct
                         var x=1 //Here we declare a variable in order of knowing if we have already enter to this conditional
                         res.render("login",{errors:{validationPassword:{msg:"wrong password"}},old:req.body})//If the password that the user wants to use, the errors are sended
                    }
               }
          }
               // At this point, we are out of the for
               // If x=1 that means that the user was found in the code above, because a code inside a conditional that says: if (users[i].email == req.body.email) was executed.
               if (loggedUser == undefined && x!=1) { //If the user was not found and x is not 1 (that means that we did not enter to the last conditional else, i.e. 6 lines up). That can be traslated such as the password is correct but the user does not.            
               res.render("login",{errors:{validationUser:{msg:"The user doesn't exist"}}}) // The error will be shared with the view
               }
     }
     else{
          res.render("login",{errors:resultValidation.mapped()}) //If in the validation there are some mistakes, those are sent to the view
     }
},


register: (req,res) => {
     res.render("register")
},

   processRegister: (req,res) => {
     const resultValidation = validationResult(req); //We save the results of the validation

     if (resultValidation.errors.length > 0) { //Errors its an array with one index per every error (input in the form where whe placed a middleware), so If there are some mistakes:
          res.render("register", {errors:resultValidation.mapped(), old:req.body}) //We share to the view all the errors resulted of the validation process, as well as the information that the user already wrote.
     }

     //If there are not mistakes at all
     else{
          for (let i = 0; i<users.length; i++) {
               if (users[i].email == req.body.email) {//We verify if the user exists
                   var userExist = true;
                   res.render("register", {errors:{validationUserExist:{msg:"The user already exist"}}})//If the user exists, the operation will be interrupted inmediatly and the error will be shared with the view
                   break
               }
          }

          if (userExist != true) { //We did not want to use an else here, so if the username does not exist, we do the next conditional: 
               if (req.body.password == req.body.passwordRep) {//At this point, the username is VALID, so if the passwords that the user want to use coicides, a new user is created.           
                    const newUser = {
                    id: users[users.length - 1].id + 1, 
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password,10), //The password is hashed
                    image: req.file.filename
                    }
                    users.push(newUser) //At this point, the user is added to the database
                    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, ' ')) 
                    let loggedUser= newUser //Here, the user recently created is saved in a variable that is added to the req.session.user global variable
                    req.session.user=loggedUser
                    let emailName = loggedUser.email.split('@')
                    res.redirect("/users/profile/"+ emailName[0])  //Here we send a parametrized route
                    }
               
               else{
                    res.render("register", {errors:{validationPassword:{msg:"The password must coincide"}},old:req.body}) //If the password that the user wants to use, the errors are sended
               }
          }  
     }
},

restore: (req,res) => {
     res.render("restorePassword")
},

profile: (req,res) => {
     if (req.session.user) { //If the user is already logged, we sent him/her to his/hers profile with all the information
          res.render("profile",{user:req.session.user}) 
     }
     else{
          res.render("login")
     }
},

edit: (req, res) => {
     //Form view
     const id = parseInt(req.params.id) //Before I have had some mistakes when I asigned the id of a product or user, because for one reason those were assigned as an string, so for solving the problem, I always convert the strings into integers. The id is obtained from the query string.
     const user = users.find(element => element.id == id) //The constant user is filled with the information of the user that will be edited
     res.render("editUserView", { user }) //Finally we send the form with the information of the user
},
 
update: (req, res) => {
     //Here we process the information that was sent by post in the form of edit user.
     const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving    
     if (resultValidation.errors > 0) { //Errors its an array with one index per every error (input in the form where whe placed a middleware)
          res.render("editUserView", {errors:resultValidation.mapped(), user, old:req.body}) //We share to the view all the errors resulted of the validation process 
     }
     else{ //If there are not mistakes in the form like they forgot to fill in a blank 
          if (req.body.password == req.body.passwordRep) { //We check if the new passwords match             
          const id = parseInt(req.params.id) //Before I have had some mistakes when I asigned the id of a product or user, because for one reason those were assigned as an string, so for solving the problem, I always convert the strings into integers. The id is obtained from the query string.
          var idx = users.findIndex(element => element.id == id)//We search for the user that needs to be edited

          //Deleting the previous image 
          const deletePath = path.join(__dirname, '../public/img/users/'+users[idx].image) //With this method, we delete the last image that the user had.
          fs.unlink(deletePath, deleteFileCb)
          function deleteFileCb(error){ //An error will be thrown if the method fails.
               if (error){
                    console.log("Error in deleting the last image");
                    console.log(deletePath);
               }
          }

          users[idx] = { //We add all the new information to the user that already exist but needs to be edited
          id, 
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password,10), //Here we asign/save a hashed password.
          image: req.file.filename
          }
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, ' '))
          let loggedUser= users[idx]
          req.session.user=loggedUser //We keep the user logged
          let emailName = loggedUser.email.split('@') //Here we split the email of the user into two arrays, divided by the symbol @
          res.redirect("/users/profile/"+ emailName[0]) //Here we send a parametrized route
          }
          else{
               res.render("register", {errors:{validationPassword:{msg:"The password must coincide"}}}) //If there are some mistakes in the form like they forgot to fill in a blank, the errors are sended again
          }
     }
},
 
delete: (req, res) => {
     const id = req.params.id
     const idx =users.findIndex(p => p.id == id)
     users.splice(idx, 1) 
     fs.writeFileSync(usersFilePath, JSON.stringify(users, null, ' '))
     res.redirect("/")
   },

   logout: (req, res) => { //With this method we delete the cookien and the req.session variable. So any information about the user is saved at the moment of executing this code.
     res.clearCookie("remember")
     req.session.destroy()
     res.redirect("/")
   },

   users: (req, res) => { //With this method we delete the cookien and the req.session variable. So any information about the user is saved at the moment of executing this code.
      //Usamos el nombre del alias para acceder al modelo que deseamos. 
     db.Users.findAll() //The method findAll, bring us all the registers  of a table
     .then(function(Users){ //We use a then because we are in an asyncronus language. This function is which in fact receives the Users
          res.render("Users", {Users}) //The action
     })
   }
}
module.exports=controller