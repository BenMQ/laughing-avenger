/**
 * Defines routes for application
*/
exports.main = function(req, res) {
    res.render('socketBoard');
}

exports.masterArr = function(req, res) {
    res.json(masterArr);
}

exports.modulePage = function(req,res){
    res.send('Welcome to ' + req.params.moduleCode);
}

exports.dashBoard = function(req,res){
    res.send('Welcome to your dashboard!');
}
