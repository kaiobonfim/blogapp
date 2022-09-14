module.exports = {
    isAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.isAdmin == 1){
            return next()
        }else{
            req.flash("error_msg", "Forbidden")
            res.redirect("/")
        }
    }
}