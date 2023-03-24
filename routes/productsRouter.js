const express = require("express") 
const router = express.Router() 
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator'); //We just use the body function, not all the library, so with destructuring assigment we are able to instance the function body in the constant body

// Requires
const productsController=require("../controllers/productsController") 

//Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/products/selectProducts'))
  },
  filename: function (req, file, cb) {
    const nombre = file.originalname
    // let idx = 0; 
    // for (let i = nombre.length; i >= 0; i--) {
    //   const char = nombre[i]
    //   if (char === '.') {
    //     idx = i
    //     break;
    //   }
    // }  
    // const name = nombre.slice(0, idx)
    const ext = file.mimetype.split('/')
    cb(null, file.fieldname + '-' + Date.now()+"."+ext[1]) //We also could use the path.extname(file.originalname)
  }
})
const upload = multer({ storage }) //With the const storage, we asign the name and destination of our file

//Validations
const validateEditForm = [
  body("name").notEmpty().withMessage("You must fill the name"),
  body("price").notEmpty().withMessage("You must fill the price").bail()
  .isNumeric().withMessage("It needs to be a number"),
  body("discount").notEmpty().withMessage("You must fill the discount").bail()
  .isNumeric().withMessage("It needs to be a number"),
  body("msi").notEmpty().withMessage("You must fill the MIF").bail()
  .isNumeric().withMessage("It needs to be a number"),
  body("description").notEmpty().withMessage("You must fill the description"),
]; //The validations must live in an array (one element for each name of the form that we want to validate)

const validateCreateForm = [
  body("name").notEmpty().withMessage("You must fill the name"),
  body("price").notEmpty().withMessage("You must fill the price").bail()
  .isNumeric().withMessage("It needs to be a number"),
  body("discount").notEmpty().withMessage("You must fill the discount").bail()
  .isNumeric().withMessage("It needs to be a number"),
  body("mif").notEmpty().withMessage("You must fill the MIF").bail()
  .isNumeric().withMessage("It needs to be a number"),
  body("description").notEmpty().withMessage("You must fill the description"),

  body("image").custom((value, {req}) => { //There are not validations from express to validate files, so we need to do CUSTOM VALIDATIONS, the structure are all in the documentation
    let file =req.file;
    if(!file){
      throw new Error ("You must uppload an image");
    }
    else{
      let acceptedExtensions = [".jpg", ".png", ".gif", ".jpeg"];
      let fileExtension = path.extname(file.originalname);
      if(!acceptedExtensions.includes(fileExtension)){ //Includes return true or false if a paramenter is included in the analized array (for example, we will obtain a true if the extension of the uploaded file contains the extensions that are accepted )
        throw new Error ("The image extension accepted are: jpg, png, .jpeg and gif ");
      }
    }

    return true; //In documentation I read that we must send a true
  })
];

// CRUD
// Get
router.get("/",productsController.products) 
router.get("/create",productsController.createForm) 
router.get("/shoppingcar",productsController.shoppingCar)
router.get("/detail/:id",productsController.detail)
router.get("/edit/:id",productsController.editForm) 

// Post
router.post('/create', upload.single('image'), validateCreateForm, productsController.createStore);
//upload.single('image'), only one image (which was uploaded in the name="image")

// Put
router.put('/edit/:id', validateEditForm, productsController.editUpdate);

// Delete
router.delete('/delete/:id', productsController.delete);

module.exports=router 