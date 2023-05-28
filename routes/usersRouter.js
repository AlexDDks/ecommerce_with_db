const express = require("express") //We required the framework Express in order to use all its methods
const router = express.Router()  //We executed the Router method, saving its properties in the const router, we don't want all the express object, just the package router, so we just use only that.
const multer = require('multer'); //We use multer library in order of being able to upload files
const { body } = require('express-validator');//We just use the body function, not all the library, so with destructuring assigment we are able to instance the function body in the constant body.
const path = require('path');// We require from Node the native module path to use it to place the image that is gonna be uploaded in the forms.

const usersController=require("../controllers/usersController") //We required the module that we have already export in the main controller

/*Multer
All this code is based in the documentation: multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/users'))//We establish where the file is gonna be saved
  },
  filename: function (req, file, cb) {
    //The file object has many properties such as originalname, mimetye, fieldname, and so on that we can use.
    cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))// Here we create the new name of the file with the object date and extension (in order of not creater duplicated names)
  }
})
const upload = multer({ storage }) //Here we save all properties of storage in the const upload

/*Validations
We use Express validator in order of validate (you will forgive the repetition) all the inputs in the forms. The sintax is based on documentation. The most of the validation are centered avoiding the null values in the blanks (not empty), so in the object resultsValidation of express validator it's gonna appear all the results of the fields that have some mistakes, that information is gonna be used in the controller and views. The atribute bail allow us to include more that one validation.*/
const validationLogin =[
    body("email").notEmpty().withMessage("You must fill the blank").bail().isEmail().withMessage("It needs to be email"),
    body("password").notEmpty().withMessage("You must write your password")
]//The validations must live in an array (one element for each name of the form that we want to validate)

const validationRegister =[
    body("email").notEmpty().withMessage("You must write an email").bail().isEmail().withMessage("It needs to be email"),
    body("password").notEmpty().withMessage("You must write a password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"), //Here we define the characteristics of the password
    body("passwordRep").notEmpty().withMessage("You must write again a password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
    body("image").custom((value, {req}) => { //There are not validations from express to validate files, so we need to do CUSTOM VALIDATIONS, the structure are all on the documentation
        let file =req.file;//In the req objetc (the req object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on) the file object file is included thanks to the use of multer, so we save all its properties in the the file variable.
        if(!file){//If a file wasn't upploaded, a mistake is gonna appear
          throw new Error ("You must uppload an image");
        }
        else{//If a file was upploaded, this next sections of validations are gonna be executed
          let acceptedExtensions = [".jpg", ".png", ".gif", ".jpeg"];//In this variable, we saved an array of strings with some common extensions of images
          let fileExtension = path.extname(file.originalname);//With the object file, there was upploaded its information such as the complete name saved in the propertie "originalname". The path.extname() method returns the extension of a file path what is saved in this variable
          if(!acceptedExtensions.includes(fileExtension)){ //Includes return true or false if a paramenter is included in the analized array (for example, we will obtain a true if the extension of the uploaded file contains the extensions that are accepted). The includes() method determines whether an array includes a certain value among its entries, returning true or false as appropriate. So if the return is false, a new error is send
            throw new Error ("The image extension accepted are: jpg, png, .jpeg and gif ");//Error
          }
        }   
        return true; //In documentation I read that we must send a true
      })
]

const validateEditForm = [ //The same as above
  body("email").notEmpty().withMessage("You must fill the blank").bail().isEmail().withMessage("It needs to be email"),
  body("password").notEmpty().withMessage("You must write your password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
  body("passwordRep").notEmpty().withMessage("You must write again your password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
  // body("image").custom((value, {req}) => { 
  //     let file =req.file;
  //     if(!file){
  //       throw new Error ("You must uppload an image");
  //     }
  //     else{
  //       let acceptedExtensions = [".jpg", ".png", ".gif", ".jpeg"];
  //       let fileExtension = path.extname(file.originalname);
  //       if(!acceptedExtensions.includes(fileExtension)){ 
  //         throw new Error ("The image extension accepted are: jpg, png, .jpeg and gif ");
  //       }
  //     }   
  //     return true; //In documentation I read that we must send a true
  //   })
]; //The validations must live in an array (one element for each name of the form that we want to validate)


// CRUD
//GET
router.get("/login",usersController.login)
router.get("/signup",usersController.register) 
router.get("/profile/:id?",usersController.profile) //The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/user/profile/<%= user.id %>">
router.get("/edit/:id", usersController.edit)//The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/useredit/<%= user.id %>">
router.get("/logout", usersController.logout)
router.get("/users", usersController.users)


//POST
router.post("/login", validationLogin, usersController.processLogin) 
router.post("/register", upload.single("image"), validationRegister, usersController.processRegister) //This route sends us to the controller that made all the magi to upload an image and save it in the DB. upload.single('image'), means that only one image (which was uploaded in the fild name="image") is gonna be uploaded

//EDIT
router.put('/edit/:id', upload.single("image"), validateEditForm ,usersController.update);//The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/user/edit/<%= user.id %>">

//DELETE
router.delete('/delete/:id', usersController.delete);//The parameter id is obtained when the user clicks on a product, and because the product itself has an id in the database, we can us it in the view with a link label, somenthing like: <a href="/user/delete/<%= user.id %>">


module.exports=router //We must export the variable router in order of being required in the entry point paths