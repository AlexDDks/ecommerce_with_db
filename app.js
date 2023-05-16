const express = require("express"); // We require from Node the "express" framework 
const app = express(); // We invoke the variable express and save the funcionality of it in the const app
const path = require("path"); // We require from Node the native module path
const publicPath = path.join(__dirname, "public"); // We save the funcionality of the method resolve in publicPath in order to have a public folder. We just have created an absolute path which will be used for the method static of express. It recieves the parameters of the route. We could just put in the arguments that the folder is PUBLIC, but in another PC, the absolute route could be different, for that reason we use the string DIRNAME, so we can reach the public folder in an absolute enviroment. __dirname is a variable that give to us the name of the folder where we are, so with __dirname, "public", we create a path that ends in the folder "public".

const session = require("express-session")//?
var cookieParser = require('cookie-parser')//?

app.use(session({secret: "Secret!!!"})) //Using of session at app level

//Public folder
app.use(express.static(publicPath)) // Using the method static we tell to express where the direction of public folder is. It recieves a root that in this case is insede the variable publicPath.

// Cookies
app.use(cookieParser()); // This is a native module, that allows us to use cookies.

const rememberMiddleware = require("./middlewares/rememberMiddleware")
app.use(rememberMiddleware) //The middleware of cookie is gonna be executed every time, in every req,res.


//User
const localsUser = require("./middlewares/localsUser")
app.use(localsUser)

// View engine
app.set('view engine', 'ejs'); // We are using the EJS view engine, so we tell it to Express in order to use it.

// POST obligated lines
app.use(express.urlencoded({ extended: false })) //To capture the information from forms (post), that receives an object with propertie and value extended: false.
app.use(express.json())

//PUT-DELETE obligated lines
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// Routes
const mainRouter = require("./routes/mainRouter")
const usersRouter = require("./routes/usersRouter")
const productsRouter = require("./routes/productsRouter")
// const servicesRouter = require("./routes/servicesRouter")

// Paths for router
app.use("/", mainRouter)
app.use("/users", usersRouter)
app.use("/products", productsRouter)
// app.use("/services", servicesRouter)

// 404 error set
app.use((req, res, next) => {
    res.status(404).render('not-found')
})

// Server
app.listen(3000, () => { // Whit the listen method, we created a server in the port 3000. In order to figured out if the server is working, we can add a message in console that is gonna be shown only if rhe server is running
    return console.log("Server has been created in port 3000")
})

