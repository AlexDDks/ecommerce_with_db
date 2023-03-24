function userMiddleware (req, res, next) {
    if (req.session.user)  { //Here we implement that if the cookie named remember exist (in the controller of users we implement that the user must have checked up the button of remember me), but the req.session has expired (for example, if we close the browser) we assign a variable called loggedUser with the user that signed up before. If loggedUser already exist, nothing of this happend.
       res.locals.user=req.session.user
    }
    next()
}

module.exports = userMiddleware