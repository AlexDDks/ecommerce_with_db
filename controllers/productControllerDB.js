const {validationResult} = require("express-validator") //We just need the result of the validation, so we just do destructuring to obtain it from the object of express validator
const db = require("../database/models");

const controller = {

  productsList: (req, res) => { 
    //We use the name of the ALIAS of the model what we want to get information
    db.Product.findAll() //The method findAll, bring us all the registers  of a table
    .then(function(Products){
      res.render("products", {Products})
    })
  },

  detail: async (req, res) => {
  const id = req.params.id //We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/detail/<%= product.id %>">
  const product = await db.Product.findByPk(id);
  if (product === null){
    console.log('Not found!');
  } 
  else{
      if (product.discount) {
      const { discount, price } = product; //With destructuring we obtain those properties of the object that we already found with the find() method, in order of using it to obtain the price with discount of the product
      const finalPrice = discount * price /100;  //We obtain the value in $ of the discount
      product.finalPrice = price-finalPrice; //We obtain the value in $ of final price and we add this information into the product, because this information is gonna be used by the view
      res.render("detail2", { product})//We render the view and send all necesary information by the const product
      }
      else{
      const {price } = product; //With destructuring we obtain those properties of the object that we already found with the find() method, in order of using it to obtain the price with discount of the product
      product.finalPrice = price; //We obtain the value in $ of final price and we add this information into the product, because this information is gonna be used by the view
      res.render("detail2", {product})//We render the view and send all necesary information by the const product
      }
    }
  }
 ,

  createForm: (req, res) => { //This method only render the form of create product
  res.render("createForm")
},

  createStore:(req, res) => {
  const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving
  if (resultValidation.errors.length > 0) { //resultValidation is an objetc with a propertie called errors, where all errors its an array with one index per every error, so if there are some errors, the array isn't gonna be empty
      res.render("createForm", {errors:resultValidation.mapped(), old:req.body})//We render the view again and also all the errors resulted of the validation process. When we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value) 
  }
  else{
    db.Product.create({
      ...req.body,
      image: req.file.filename
  })
  db.Product.findAll() //The method findAll, bring us all the registers  of a table
  .then(function(Products){
    console.log(Products.length);
  })

  res.redirect("/products") //We redirect the user to the page of the products
  }
  },

  shoppingCar: (req,res) => { //This method only render
        res.render("shoppingCar")
   },

  editForm: async (req, res) => {//This method only render the view detail and sends a form with the information of one product
    const id = req.params.id//We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/edit/<%= product.id %>">
    const product = await db.Product.findByPk(id)//The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"
    res.render("editFormProducts", { product })//We render the view and send all necesary information by the const product
  },

  editUpdate: async (req, res) => {
    const id = req.params.id //We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/detail/<%= product.id %>">
   var product = await db.Product.findByPk(id);
    if (product === null){
      console.log('Not found!');
    }
    else{
      // Sending the error if those exist
    const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving
    if (resultValidation.errors.length > 0) { //resultValidation is an objetc with a propertie called errors, where all errors its an array with one index per every error, so if there are some errors, the array isn't gonna be empty
        res.render("editFormProducts", {errors:resultValidation.mapped(), product, old:req.body}) //We render the view again and also all the errors resulted of the validation process. When we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value) 
    }
    else{
          product= await product.update({ //we are positioned in the index of the product to edit
          //We add all the new information into the index of the requested id (only into the product that was required), all the others objects in the JSON are gonna be without any edit
          ...req.body,
        }) 
          res.redirect("/products/detail/" + id) //We redirect the user to the page of the detail of the product that has already edit
    }
    } 
  },  

  delete: async (req, res) => { //This method delete a product
    await db.Product.destroy({
      where:{
        id:req.params.id
      }
    })    
    res.redirect("/products") //Here we redirect to the page products in order of verify that the item was deleted
  }
}

module.exports=controller