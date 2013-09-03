/**
 * Defines routes for application
*/


// Route for Fragen index page
exports.index = function(req,res){
    res.render('welcome');
}

exports.main = function(req, res) {
    console.log("SessionID:" + req.sessionID);
    console.log(req.session.passport); //retrieve user passport

    res.render('socketBoard', { user: req.user, });
}


exports.postAuthenticate = function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
}

exports.loginError = function(req,res){
    res.send("Failed to log in.");
}

exports.logout = function(req, res){
    req.logout();
    console.log("You are logged out!");
    res.redirect('/');
}

exports.post = function(req, res){

}

exports.modulePage = function(req,res){
    res.send('Welcome to ' + req.params.moduleCode);
}
