/**
 * Defines routes for application
*/
exports.main = function(req, res) {
    // console.log(req.user);

    console.log("SessionID:" + req.sessionID);
    console.log(req.session.passport); //retrieve passport's user ID


    res.render('socketBoard', { user: req.user });
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
