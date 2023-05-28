const {validationResult} = require("express-validator");//We just need the result of the validation, so we just do destructuring to obtain it from the object of express validator
const path = require('path'); //We require the module path because we need to specify where the DB is
const fs = require('fs'); //We require the module File System because we need to used the method readFileSync
const bcrypt = require('bcrypt'); //We require the module bcrypt to use a method of hash the password of the user
const usersFilePath = path.join(__dirname, '../data/userDataBase.json');//Here we specify where the DB is (saving the path in a const)
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));// Because the DB is a JSON, we need to parse it (from JSON to an object), so we need this method that converts JSON into an object. The JSON is obtained from the path defined with the method join, the method readFileSync allow us to read a file (specifying where it is with the path) and includes the option(encoding) "utf-8" that allows to the browser render "stranger" symbols like accents and so on
let db = require("../database/models");
const { log } = require("console");

const controller = {
   login: (req,res) => {
     if (req.session.user) {//If the log in view is visited, but the req.session.user exists is because the user is already logged and the req.session.user variable has not been deleted
          let loggedUser =req.session.user//The information in the global variable now has been save in this new variable in order of obtain information to parameterize the path to be redirected
          let emailName = loggedUser.email.split('@')//The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
          res.redirect("/users/profile/"+ emailName[0]) //As the user is logged, we sent him/her to its profile with his/hers information
     }
     else{
        res.render("login") //If the user is not logged, the view login is rendered
     }
     },

   processLogin: (req, res) =>{
     //Here we process when an user tries to login in our website
     const resultValidation = validationResult(req); //We save the results of the validation in this constant
     if (resultValidation.isEmpty()) {//If there are not errors at all, we enter to this conditional

          for (let i = 0; i<users.length; i++) {//Here we iterates in every user in the db

               if (users[i].email == req.body.email) {//We search in the database until we match the user that want to login.
                    
                    //THE USER EXISTS. If the user is found, we check for the passwords. 
                    if (bcrypt.compareSync(req.body.password, users[i].password)) {
                    //THE PASSWORD IS CORRECT. If the conditional is true(the passwords from the form and the database coincides, we enter to the new conditional. Remember that we are using the method compareSync
                    var loggedUser= users[i] //Here, the user that was already found is saved in a variable that is added to the req.session.user global variable
                    req.session.user=loggedUser//This global variable now has all the information of the user that wants to log in
                    let emailName = loggedUser.email.split('@') //The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
                      //Cookies
                    if(req.body.remember !=undefined){ //If the checkbox is selected (in the form, the name of the input was remember)
                    res.cookie("remember",loggedUser.email, {maxAge: 60000}) //We built a cookie named as we want (in this case remember), where into it we save the email of the loggedUser, just the email because the cookies has limited space. The configuration maxAge say how many time the cookie is gonna live (in ms). Later, the email into the cookie is going to be used in a global middleware to keep the user logged. If the user close the browser, the session is gonna expired, but the cookie is gonna live its maxAge
                    }
                    res.redirect("/users/profile/"+ emailName[0])//Here we send a parametrized route, based in the username without the extension of the email
                    break
                    // Until here the password is correct and the user exists, we get out from the form and the method.
                    }

                    else{
                    //THE PASSWORD IS NOT CORRECT. If we arrive until here, the user exists but the password is not correct
                         var x=1 //Here we declare a variable in order of knowing if we have already enter to this conditional
                         res.render("login",{errors:{validationPassword:{msg:"wrong password"}},old:req.body})//If the password that the user wants to use is incorrect, the errors are sent. The variable old, saves all information that the user sent at the first time, in order of place it as a default value in the form if there were some errors
                    }
               }
          }
               // At this point, we are out of the for
               // If x=1 that means that the user was found in the code above, because a code inside a conditional that says: if (users[i].email == req.body.email) was executed.
               if (loggedUser == undefined && x!=1) {
                    //THE PASSWORD IS CORRECT BUT THE USER IS NOT. If the user was not found and x is not 1 (that means that we did not enter to the last conditional else, i.e. 6 lines up). That can be traslated such as the password is correct but the user does not.            
               res.render("login",{errors:{validationUser:{msg:"The user doesn't exist"}}}) // The error will be shared with the view
               }
     }
     else{
          //THERE ARE MISTAKES IN THE VALIDATIONS OF THE FORMS
          res.render("login",{errors:resultValidation.mapped()}) //If in the validation there are some mistakes, those are sent to the view. When we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value).
     }
},

register: (req,res) => {//This method only render
     res.render("register")
},

   processRegister: (req,res) => {
     const resultValidation = validationResult(req);//The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving
     if (resultValidation.errors.length > 0) {//resultValidation is an objetc with a propertie called errors, where all errors its an array with one index per every error, so if there are some errors, the array isn't gonna be empty
          res.render("register", {errors:resultValidation.mapped(), old:req.body})//We render the view again and also all the errors resulted of the validation process. When we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value). The variable old, saves all information that the user sent at the first time, in order of place it as a default value in the form if there were some errors
     }
     //If there are not mistakes at all
     else{
          for (let i = 0; i<users.length; i++) {//We iterate in all the users in the DB in order of knowing if the email of the user already exists
               if (users[i].email == req.body.email) {//For each iteration, we verify if the user exists
                   var userExist = true; //Here we have arrive only if the user exist and we asign the value true to a variable in order to use it in the next conditional
                   res.render("register", {errors:{validationUserExist:{msg:"The user already exist"}}})//If the user exists, the operation will be interrupted inmediatly and the error will be shared with the view
                   break
               }
          }

          if (userExist != true) { //We did not want to use an else here, so if the username does not exist, we do the next conditional: 
               if (req.body.password == req.body.passwordRep) {//At this point, the username is VALID, so if the passwords that the user want to use coicides, a new user is created.           
                    const newUser = { //The const newUser will have all the information that came from the body (the form)
                    id: users[users.length - 1].id + 1, //To know what id is the one that must be assigned to the new user: maybe we will be thinking that we can use users.length+1, but what would happen if the index 2 is deleted?, the user.length would be 3, and the new id(users.length+1)=4, but the id 4 is already used, so we must find the value of the id of the last element: to position ourselves in the last element we obtain the number of elements with users.lenght (for example 4), the result wilill be users[users.length - 1].id + 1
                    email: req.body.email,//We add the email of the user
                    password: bcrypt.hashSync(req.body.password,10), //The password is hashed
                    image: req.file.filename//We add the image of the user
                    }
                    users.push(newUser) //At this point, the user is added to the database (at the final of the array)
                    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, ' '))//Finally we convert the object into a JSON
                    let loggedUser= newUser //Here, the user recently created is saved in a variable that is added to the req.session.user global variable
                    req.session.user=loggedUser
                    let emailName = loggedUser.email.split('@') //The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
                    res.redirect("/users/profile/"+ emailName[0])//Here we send a parametrized route, based in the username without the extension of the email
                    }
               
               else{
                    res.render("register", {errors:{validationPassword:{msg:"The password must coincide"}},old:req.body}) //If the password that the user wants to use doesn't coincides, the errors are sended. The variable old, saves all information that the user sent at the first time, in order of place it as a default value in the form if there were some errors
               }
          }  
     }
},

restore: (req,res) => { //This method just render a view
     res.render("restorePassword")
},

profile: (req,res) => {
     if (req.session.user) { //If the user is already logged, we sent him/her to his/hers profile with all the information
          res.render("profile",{user:req.session.user}) //We send all the information of the user, to the view
     }
     else{
          res.render("login") //If the user is not logged, we sent the view login
     }
},

edit: (req, res) => {
     //Form view
     const id = parseInt(req.params.id) //Before, I had had some mistakes when I asigned the id of a product or user, because foran unknown reason, those were assigned as an string, so, to solve the problem, I always convert the strings into integers. The id is obtained from the query string.
     const user = users.find(element => element.id == id) //The constant user is filled with the information of the user that will be edited. The find() method returns the first element in the array of users(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first user that match with the id that is required in the URL and saves it into the const "user"
     res.render("editUserView", { user }) //Finally we send the form with the information of the user
},
 
update: (req, res) => {
     const id = parseInt(req.params.id) //Before, I had had some mistakes when I asigned the id of a product or user, because foran unknown reason, those were assigned as an string, so, to solve the problem, I always convert the strings into integers. The id is obtained from the query string.
     const user = users.find(element => element.id == id) //The constant user is filled with the information of the user that will be edited. The find() method returns the first element in the array of users(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first user that match with the id that is required in the URL and saves it into the const "user"
     //Here we process the information that was sent by post in the form of edit user.     
     const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving  

     if (resultValidation.errors.length > 0) { //Errors its an array with one index per every error (input in the form where whe placed a middleware). ResultValidation is an objetc with a propertie called errors, where all errors its an array with one index per every error, so if there are some errors, the array isn't gonna be empty
          res.render("editUserView", {errors:resultValidation.mapped(), user, old:req.body})//We render the view again and also all the errors resulted of the validation process. When we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value). The variable old, saves all information that the user sent at the first time, in order of place it as a default value in the form if there were some errors
     }
     //If there are not mistakes in the form like they forgot to fill in a blank 
     else{ 

          for (let i = 0; i<users.length; i++) {//We iterate in all the users in the DB in order of knowing if the email of the user already exists
               
               if (users[i].email == req.body.email && user.email!=req.body.email) {//For each iteration, we verify if the user exists AND if its different to the currently. THE USAR IS ABLE OF USING ITS CURRENTLY EMAIL.
                   var userExist = true; //Here we have arrive only if the user exist and we asign the value true to a variable in order to use it in the next conditional
                   res.render("editUserView", {errors:{validationUserExist:{msg:"The user already exist"}}, user, old:req.body})//If the user exists, the operation will be interrupted inmediatly and the error will be shared with the view
                   break
               }
          }

          if (userExist != true) { //If the email is available the conditional runs

                    if (req.body.password == req.body.passwordRep) { //We check if the new passwords match             
                         const id = parseInt(req.params.id) //Before I have had some mistakes when I asigned the id of a product or user, because for one reason those were assigned as an string, so for solving the problem, I always convert the strings into integers. The id is obtained from the query string.
                         var idx = users.findIndex(element => element.id == id)//We search for the index of the user that needs to be edited

                         if (req.file) {
                              //Deleting the previous image 
                              const deletePath = path.join(__dirname, '../public/img/users/'+users[idx].image) //We save the path of the image that the user has
                              fs.unlink(deletePath, deleteFileCb)//The fs.unlink() method is used to remove a file or symbolic link from the filesystem
                              function deleteFileCb(error){ //An error will be thrown if the method fails.

                                   if (error){
                                        console.log("Error in deleting the last image");
                                        console.log(deletePath);
                                   }
                              }
                              users[idx] = { //We add all the new information to the user that already exist but needs to be edited
                                   id, 
                                   email: req.body.email,//Here we add the new email
                                   password: bcrypt.hashSync(req.body.password,10), //Here we asign/save a hashed password.
                                   image: req.file.filename//Here we add the new image
                                   }
                         }

                         else{
                              users[idx] = { //We add all the new information to the user that already exist but needs to be edited
                                   id, 
                                   email: req.body.email,//Here we add the new email
                                   password: bcrypt.hashSync(req.body.password,10), //Here we asign/save a hashed password.
                                   image: user.image//Here we add the new image
                                   }
                         }
                         fs.writeFileSync(usersFilePath, JSON.stringify(users, null, ' '))
                         let loggedUser= users[idx]
                         req.session.user=loggedUser //We keep the user logged
                         let emailName = loggedUser.email.split('@') //The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
                         res.redirect("/users/profile/"+ emailName[0])//Here we send a parametrized route, based in the username without the extension of the email
                         }

                         else{
                              res.render("register", {errors:{validationPassword:{msg:"The password must coincide"}}}) //If the password that the user wants to use doesn't coincides, the errors are sended
                         }
               }

               //The user wants to use a mail account that is used and is not the same that he/she had
               else{
                    res.render("editUserView", {errors:{validationUserExist:{msg:"The user already exist"}}, user, old:req.body})//If the user exists, the operation will be interrupted
               }          
     }
},
 
delete: (req, res) => {//This method delete an user
     const id = req.params.id//We obtain the id of the user from the URL, remember that the id is sends by the view, because when the user clicks a user, it itself has an id, and each user has the label a, which includes the parametrized path with the id. Something like: <a href="/users/delete/<%= user.id %> by delete method">
     const idx =users.findIndex(p => p.id == id)//This method returns the index of the first element in an array that satisfies the provided testing function, (the id) i.e. the variable "p" iterates in each element of the array and returns the first index that match with the id that is required in the URL and saves it into the const "idx"
     users.splice(idx, 1)//This methid delete in the following steps (index where is gonna delete, items that are gonna delete) in my case, this method delete one item in the index "i"
     fs.writeFileSync(usersFilePath, JSON.stringify(users, null, ' ')) //Rewrite the JSON without the item deleted.
     res.redirect("/")//Here we redirect to the page products in order of verify that the item was deleted
   },

   logout: (req, res) => { //With this method we delete the cookie and the req.session variable. So any information about the user is deleted at the moment of executing this code.
     res.clearCookie("remember") //We delete the cookie
     req.session.destroy()//We delete the sessions variables
     res.redirect("/")//We redirect to the index
   },

   users: (req, res) => { 
      //Usamos el nombre del alias para acceder al modelo que deseamos. ACA ES TEMA DE BASE DE DATOS
     db.Users.findAll() //The method findAll, bring us all the registers  of a table
     .then(function(Users){ //We use a then because we are in an asyncronus language. This function is which in fact receives the Users
          res.render("Users", {Users}) //The action
     })
   }
}
module.exports=controller