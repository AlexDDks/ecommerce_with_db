const {validationResult} = require("express-validator");//We just need the result of the validation, so we just do destructuring to obtain it from the object of express validator
const path = require("path")
const fs = require ("fs")
const bcrypt = require('bcrypt'); //We require the module bcrypt to use a method of hash the password of the user
let db = require("../database/models");

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

          db.User.findAll() //The method findAll, bring us all the registers  of a table
          .then(function (Users){
              
               for (let i = 0; i<Users.length; i++) {//Here we iterates in every user in the db

                    if (Users[i].email == req.body.email) {//We search in the database until we match the user that want to login.
                         
                         //THE USER EXISTS. If the user is found, we check for the passwords. 
                         if (bcrypt.compareSync(req.body.password, Users[i].password)) {
                         //THE PASSWORD IS CORRECT. If the conditional is true(the passwords from the form and the database coincides, we enter to the new conditional. Remember that we are using the method compareSync
                         var loggedUser= Users[i] //Here, the user that was already found is saved in a variable that is added to the req.session.user global variable
                         req.session.user=loggedUser//This global variable now has all the information of the user that wants to log in
                         let emailName = loggedUser.email.split('@') //The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
                           //Cookies
                         if(req.body.remember !=undefined){ //If the checkbox is selected (in the form, the name of the input was remember)
                         res.cookie("remember",loggedUser.email, {maxAge: 600000}) //We built a cookie named as we want (in this case remember), where into it we save the email of the loggedUser, just the email because the cookies has limited space. The configuration maxAge say how many time the cookie is gonna live (in ms). Later, the email into the cookie is going to be used in a global middleware to keep the user logged. If the user close the browser, the session is gonna expired, but the cookie is gonna live its maxAge
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
          })

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
           db.User.findAll() //The method findAll, bring us all the registers  of a table
          .then(function (Users){ //We use a then because we are in an asyncronus language. This function is which in fact receives the Products
              
          for (let i = 0; i<Users.length; i++) {//We iterate in all the users in the DB in order of knowing if the email of the user already exists
               
               if (Users[i].email == req.body.email) {//For each iteration, we verify if the user exists
                   var userExist = true; //Here we have arrive only if the user exist and we asign the value true to a variable in order to use it in the next conditional
                   res.render("register", {errors:{validationUserExist:{msg:"The user already exist"}}})//If the user exists, the operation will be interrupted inmediatly and the error will be shared with the view
                   break
               }
          }

          if (userExist != true) { //We did not want to use an else here, so if the username does not exist, we do the next conditional: 
              
               if (req.body.password == req.body.passwordRep) {//At this point, the username is VALID, so if the passwords that the user want to use coicides, a new user is created.
                    let emailName = req.body.email.split('@')
                    db.User.create({
                    userName:emailName[0],
                    email: req.body.email,//We add the email of the user
                    password: bcrypt.hashSync(req.body.password,10), //The password is hashed
                    image: req.file.filename//We add the image of the user
                    }).then(newUser => {
                         console.log(newUser);
                         let loggedUser = newUser
                         req.session.user=loggedUser
                         res.redirect("/users/profile/"+ emailName[0])//Here we send a parametrized route, based in the username without the extension of the email
                    })
                    }
               
               else{
                    res.render("register", {errors:{validationPassword:{msg:"The password must coincide"}},old:req.body}) //If the password that the user wants to use doesn't coincides, the errors are sended. The variable old, saves all information that the user sent at the first time, in order of place it as a default value in the form if there were some errors
               }
          }  
          })
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

edit: async (req, res) => {//This method only render the view detail and sends a form with the   information of one product
     const id = req.params.id//We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/edit/<%= product.id %>">
     const user = await db.User.findByPk(id)//The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"
     res.render("editUserView", { user })//We render the view and send all necesary information by the const product
},
 
update: async (req, res) => {
     const id = (req.params.id)
     let user = await db.User.findByPk(id);

     const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving  
     
     if (resultValidation.errors.length > 0) { //Errors its an array with one index per every error (input in the form where whe placed a middleware). ResultValidation is an objetc with a propertie called errors, where all errors its an array with one index per every error, so if there are some errors, the array isn't gonna be empty
          res.render("editUserView", {errors:resultValidation.mapped(), user, old:req.body})//We render the view again and also all the errors resulted of the validation process. When we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value). The variable old, saves all information that the user sent at the first time, in order of place it as a default value in the form if there were some errors
     }

     //If there are not mistakes in the form like they forgot to fill in a blank 
     else{ 

          db.User.findAll().then((users) => {
               for (let i = 0; i<users.length; i++) {//We iterate in all the users in the DB in order of knowing if the email of the user already exists
                    if (users[i].email == req.body.email && user.email!=req.body.email) {//For each iteration, we verify if the user exists AND if its different to the currently. THE USAR IS ABLE OF USING ITS CURRENTLY EMAIL.
                        var userExist = true; //Here we have arrive only if the user exist and we asign the value true to a variable in order to use it in the next conditional
                        res.render("editUserView", {errors:{validationUserExist:{msg:"The user already exist"}}, user, old:req.body})//If the user exists, the operation will be interrupted inmediatly and the error will be shared with the view
                        break
                    }
               }

               if (userExist != true) { //If the email is available the conditional runs
                    if (req.body.password == req.body.passwordRep) { //We check if the new passwords match             
                              let emailName = req.body.email.split('@')

                         if (req.file) {
                              //Deleting the previous image 
                              const deletePath = path.join(__dirname, '../public/img/users/'+user.image) //We save the path of the image that the user has
                              fs.unlink(deletePath, deleteFileCb)//The fs.unlink() method is used to remove a file or symbolic link from the filesystem
                              function deleteFileCb(error){ //An error will be thrown if the method fails.

                                   if (error){
                                        console.log("Error in deleting the last image");
                                        console.log(deletePath);
                                   } 
                              }
                              
                                   user.update({
                                   userName:emailName[0],
                                   email: req.body.email,//We add the email of the user
                                   password: bcrypt.hashSync(req.body.password,10), //The password is hashed
                                   image: req.file.filename//We add the image of the user
                                   })
                         }

                         else{
                              user.update({
                                   userName:emailName[0],
                                   email: req.body.email,//We add the email of the user
                                   password: bcrypt.hashSync(req.body.password,10), //The password is hashed
                                   image: user.image//We add the image of the user
                                   })
                         }
                         let loggedUser= user
                         req.session.user=loggedUser //We keep the user logged
                         // let emailName = loggedUser.email.split('@') //The split() method takes a pattern and divides a String into an ordered list of substrings by searching for the pattern, puts these substrings into an array, and returns the array. In this case we will have an array of two index ["nameOfTheEMail", "gmail.com"], because we have split taking the @ as separator.
                         res.redirect("/users/profile/"+ emailName[0])//Here we send a parametrized route, based in the username without the extension of the email
                         }

                         else{
                              res.render("register", {errors:{validationPassword:{msg:"The password must coincide"}}}) //If the password that the user wants to use doesn't coincides, the errors are sended
                         }
               }
          })                  
     }
},
 
delete: async (req, res) => {//This method delete an user
     await db.User.destroy({
          where: {
               id:req.params.id
          }
     })
     res.redirect("/")//Here we redirect to the page products in order of verify that the item was deleted
},

   logout: (req, res) => { //With this method we delete the cookie and the req.session variable. So any information about the user is deleted at the moment of executing this code.
     res.clearCookie("remember") //We delete the cookie
     req.session.destroy()//We delete the sessions variables
     res.redirect("/")//We redirect to the index
}

}

module.exports=controller