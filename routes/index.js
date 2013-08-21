/**
 * Defines routes for application
*/
exports.main = function(req, res) {
    console.log(req.user);
    res.render('socketBoard', { user: req.user });
}

exports.modulePage = function(req,res){
    res.send('Welcome to ' + req.params.moduleCode);
}

exports.dashBoard = function(req,res){
    res.send('Welcome to your dashboard!');
}

exports.login = function(req, res){
  res.render('login', { user: req.user });
}

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
}
