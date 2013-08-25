/**
 * Defines routes for application
*/

exports.index = function(req,res){
    res.render('welcome');
}

exports.main = function(req, res) {
    console.log("SessionID:" + req.sessionID);
    console.log(req.session.passport); //retrieve user passport

    if(req.isAuthenticated()){
        res.render('socketBoard', { user: req.user });
    } else {
        res.redirect("/");
    }

}

exports.modulePage = function(req,res){
    res.send('Welcome to ' + req.params.moduleCode);
}

exports.dashBoard = function(req,res){
    res.send('Welcome to your dashboard!');
}

exports.postAuthenticate = function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
}

exports.loginError = function(req,res){
    console.log("Login error log");
}

exports.logout = function(req,res){
    console.log(res)
    console.log("You are logged out!");
}
