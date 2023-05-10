const express = require("express") //We required the framework Express in order to use all its methods
const router = express.Router() //We executed the Router method, saving its properties in the const router
const multer = require('multer'); //We use multer library in order of being able to upload files
const { body } = require('express-validator'); //We use the method body of express validator
const path = require('path');

const usersController=require("../controllers/usersController") //We required the module that we have already export in the main controller

//Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/users'))
  },
  filename: function (req, file, cb) {
    const nombre = file.originalname
    cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
  }
})
const upload = multer({ storage }) //With the const storage, we asign the name and destination of our file

//VALIDATIONS
const validationLogin =[
    body("email").notEmpty().withMessage("You must fill the blank").bail().isEmail().withMessage("It needs to be email"),
    body("password").notEmpty().withMessage("You must write your password")
]

const validationRegister =[
    body("email").notEmpty().withMessage("You must write an email").bail().isEmail().withMessage("It needs to be email"),
    body("password").notEmpty().withMessage("You must write a password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
    body("passwordRep").notEmpty().withMessage("You must write again a password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
    body("image").custom((value, {req}) => { 
        let file =req.file;
        if(!file){
          throw new Error ("You must uppload an image");
        }
        else{
          let acceptedExtensions = [".jpg", ".png", ".gif", ".jpeg"];
          let fileExtension = path.extname(file.originalname);
          if(!acceptedExtensions.includes(fileExtension)){ 
            throw new Error ("The image extension accepted are: jpg, png, .jpeg and gif ");
          }
        }   
        return true; //In documentation I read that we must send a true
      })
]

const validateEditForm = [
  body("email").notEmpty().withMessage("You must fill the blank").bail().isEmail().withMessage("It needs to be email"),
  body("password").notEmpty().withMessage("You must write your password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
  body("passwordRep").notEmpty().withMessage("You must write again your password").bail().isLength({ min: 8, max:8 }).withMessage("Must be 8 characteres"),
  body("image").custom((value, {req}) => { 
      let file =req.file;
      if(!file){
        throw new Error ("You must uppload an image");
      }
      else{
        let acceptedExtensions = [".jpg", ".png", ".gif", ".jpeg"];
        let fileExtension = path.extname(file.originalname);
        if(!acceptedExtensions.includes(fileExtension)){ 
          throw new Error ("The image extension accepted are: jpg, png, .jpeg and gif ");
        }
      }   
      return true; //In documentation I read that we must send a true
    })
]; //The validations must live in an array (one element for each name of the form that we want to validate)


// CRUD
//GET
router.get("/login",usersController.login) //By the const router, all the requirements by the clients to this will be send to the controller and its properties
router.get("/signup",usersController.register) 
router.get("/profile/:id?",usersController.profile) 
router.get("/edit/:id", usersController.edit)
router.get("/logout", usersController.logout)
router.get("/users", usersController.users)


//POST
router.post("/login", validationLogin, usersController.processLogin) 
router.post("/register", upload.single("image"), validationRegister, usersController.processRegister) 

//EDIT
router.put('/edit/:id', upload.single("image"), validateEditForm ,usersController.update);

//DELETE
router.delete('/delete/:id', usersController.delete);


module.exports=router //We must export the variable router in order of being required in the entry point paths