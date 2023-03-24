const {validationResult} = require("express-validator") //We just need the result of the validation, so we just do destructuring to obtain it

const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
  shoppingCar: (req,res) => {
        res.render("shoppingCar")
   },

  products:(req,res) => {
     res.render("products", {products})
   },

  detail: (req, res) => {
    const id = req.params.id 
    const product = products.find(element => element.id == id)  //
    const { discount, price } = product; 
    const finalPrice = discount * price /100; 
    product.finalPrice = price-finalPrice;
    res.render("detail", { product})
  },

  editForm: (req, res) => {
    const id = req.params.id
    const product = products.find(element => element.id == id)
    res.render("editFormProducts", { product })
  },

  editUpdate: (req, res) => {
    //Upload news of the product
    // Sending the error if those exist
    const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving
    const id = req.params.id;
    const product = products.find(element => element.id == id);
    if (resultValidation.errors.length > 0) { //Errors its an array with one index per every error (input in the form where whe placed a middleware)
        res.render("editFormProducts", {errors:resultValidation.mapped(), product, old:req.body}) //We share to the view all the errors resulted of the validation process 
      }
    else{
      const id = parseInt(req.params.id)
      const idx = products.findIndex(element => element.id == id) 
      products[idx] = {
      id, 
      ...req.body,
      image: products[idx].image} 
      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, ' '))
      res.redirect("/products/detail/" + id)
    }
  },

  createForm: (req, res) => {
    res.render("createForm")
  },

  createStore: (req,res) => {
    const resultValidation = validationResult(req);
    if (resultValidation.errors.length > 0) { //resultValidation is an objetc with a propertie called errors, where all errors its an array with one index per every error, when we mapped(), we transform every index in an literal object with the name of the atribute "name" in every blank, an into their properties there are placed the "msg" as "clave", and the text as value)
        res.render("createForm", {errors:resultValidation.mapped(), old:req.body})
            console.log(resultValidation.mapped());
            console.log(resultValidation);
    }
    else{
        const newProduct = {
        id: products[products.length - 1].id + 1, 
        ...req.body,  
        image: req.file.filename
        }
        products.push(newProduct) 
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, ' ')) 
        res.redirect("/products") 
    }
  },


  delete: (req, res) => {
    const id = req.params.id
    const idx = products.findIndex(p => p.id == id)
    products.splice(idx, 1) 
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, ' '))
    res.redirect("/products")
  }
}

module.exports=controller