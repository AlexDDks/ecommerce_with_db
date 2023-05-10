const express = require("express") //We required the framework Express in order to use all its methods.
const router = express.Router() //We executed the Router method, saving its properties in the const router, we don't want all the express object, just the packagerouter, so we just use only that.
const path = require('path'); // We require from Node the native module path to use it to place the image that is gonna be uploaded in the forms.
const multer = require('multer'); //We required module multer in order to use it for uplading files (specially images in this case).
const {body} = require('express-validator'); //We just use the body function, not all the library, so with destructuring assigment we are able to instance the function body in the constant body.

// Requires
const productsController=require("../controllers/productsController") //We required the module that we have already export in the controller of products.

//Multer
//All this code is based in the documentation: multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/products/selectProducts')) //We establish where the file is gonna be saved
  },
  filename: function (req, file, cb) {
    //The file object has many properties such as originalname, mimetye, fieldname, and so on that we can use.
    const ext = file.mimetype.split('/') //From the mimetype, we extract de extension. The split function "split" an string taking account a breakpoint, in this case the slash and creates an array with two items, the first one [0], with the left side of the split, and the rigth side [1] with the other one (in this case in the position 1, there is the extension), We also could use the path.extname(file.originalname) to obtain the extension
    cb(null, file.fieldname + '-' + Date.now()+"."+ext[1]) // Here we create the new name of the file with the object date and extension (in order of not creater duplicated names)
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