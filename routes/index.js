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

exports.loginError = function(req,res){
    console.log("Login error log");
}

exports.loginSuccess = function(req,res){

    //access sessionID and user after login success
    console.log(req.sessionID);

    console.log(req.session.passport); //retrieve passport's user ID

    console.log(req.user);

    console.log("Login successful.");
    res.redirect()
}


exports.logout = function(req,res){
    console.log(res)
    console.log("You are logged out!");
}
