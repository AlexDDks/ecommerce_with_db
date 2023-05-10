const controller = {

   // All the views are rendered here, as well as if some mathematical/logical operations are required, here is where the magic is done 
   index: (req,res) => {
        res.render("index")
   },

   socialMedia: (req,res) => {
      res.render("socialMedia")
   },

   contact:(req,res) => {
      res.render("contact")
   },

   personalContact:(req,res) => {
      res.render("personalContact")
   },

   pruebas:(req,res) => {
      res.render("pruebas")
   }}

module.exports=controller