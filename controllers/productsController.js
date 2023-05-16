const {validationResult} = require("express-validator") //We just need the result of the validation, so we just do destructuring to obtain it

const fs = require('fs'); //We require the module File System because we need to used the method readFileSync
const path = require('path'); //We require the module path because we need to specify where the DB is

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');//Here we specify where the DB is (saving the path in a const)
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));// Because the DB is a JSON, we need to parse it (from JSON to an object), so we need this method that converts JSON into an object. The JSON is obtained from the path defined with the method join, the method readFileSync allow us to read a file (specifying where it is with the path) and includes the option(encoding) "utf-8" that allows to the browser render "stranger" symbols like accents and so on

const controller = {
  shoppingCar: (req,res) => { //This method only render
        res.render("shoppingCar")
   },

  products:(req,res) => { //This method only render and sends all the products in the DB
     res.render("products", {products})
   },

  detail: (req, res) => { //This method only render the view detail and sends just 1 product
    const id = req.params.id //We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/detail/<%= product.id %>">
    const product = products.find(element => element.id == id)  //The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"
    const { discount, price } = product; //With destructuring we obtain those properties of the object that we already found with the find() method, in order of using it to obtain the price with discount of the product
    const finalPrice = discount * price /100;  //We obtain the value in $ of the discount
    product.finalPrice = price-finalPrice; //We obtain the value in $ of final price and we add this information into the product, because this information is gonna be used by the view
    res.render("detail2", { product})//We render the view and send all necesary information by the const product
  },

  editForm: (req, res) => {//This method only render the view detail and sends a form with the information of one product
    const id = req.params.id//We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/edit/<%= product.id %>">
    const product = products.find(element => element.id == id)//The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"
    res.render("editFormProducts", { product })//We render the view and send all necesary information by the const product
  },

  editUpdate: (req, res) => { //This method receive information from the form in the edit products view, and edit the DB with this new data.
   
    // Sending the error if those exist
    const resultValidation = validationResult(req); //The result of the validation is saved in a local variable. To the validationResult we share the request, where all information from the form is arriving
    const id = req.params.id; //We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/edit/<%= product.id %> by POST">
    const product = products.find(element => element.id == id);//The find() method returns the first element in the array of products(DB) that satisfies the provided testing function (the id) i.e. the variable "element" iterates in each element of the array and returns the first product that match with the id that is required in the URL and saves it into the const "product"

    if (resultValidation.errors.length > 0) { //Errors is an array with one index per every error (inputs in the form where whe placed a middleware)
        res.render("editFormProducts", {errors:resultValidation.mapped(), product, old:req.body}) //We share to the view all the errors resulted of the validation process 
      }
    else{
      const id = parseInt(req.params.id) //Here we convert in a integer the id because for a unknown reason it is read like an string
      const idx = products.findIndex(element => element.id == id) //This method returns the index of the first element in an array that satisfies the provided testing function, (the id) i.e. the variable "element" iterates in each element of the array and returns the first index product that match with the id that is required in the URL and saves it into the const "idx"
      products[idx] = { //We add all the new information into the index of the requested id (only into the product that was requerid), all the others objects in the JSON are gonna be without any edit
      id, 
      ...req.body, // The req.body property contains key-value pairs of data submitted in the form, such as name, price, and so on
      image: products[idx].image //We add the image into the product
    } 
      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, ' ')) //Finally we convert the object into a JSON
      res.redirect("/products/detail/" + id) //We redirect the user to the page of the detail of the product that has already edit
    }
  },

  createForm: (req, res) => { //This method only render the form of create product
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


  delete: (req, res) => { //This method delete a product
    const id = req.params.id //We obtain the id of the product from the URL, remember that the id is sends by the view, because when the user clicks a product, it itself has an id, and each product has the label a, which includes the parametrized path with the id. Something like: <a href="/products/delete/<%= product.id %> by delete method">
    const idx = products.findIndex(p => p.id == id)//This method returns the index of the first element in an array that satisfies the provided testing function, (the id) i.e. the variable "p" iterates in each element of the array and returns the first index that match with the id that is required in the URL and saves it into the const "idx"
    products.splice(idx, 1) //This methid delete in the following steps (index where is gonna delete, items that are gonna delete) in my case, this method delete one item in the index "i"
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, ' ')) //Rewrite the JSON without the item deleted.
    res.redirect("/products") //Here we redirect to the page products in order of verify that the item was deleted
  }
}

module.exports=controller