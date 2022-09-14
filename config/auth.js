const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//User model
require("../models/User")
const User = mongoose.model("users")


module.exports = function(passport){
    passport.use(new localStrategy({usernameField: "email"}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if(!user){
                return done(null, false, {message: "Account not found"})
            }else{
                bcrypt.compare(password, user.password, (error, match) => {
                    if(match){
                        return done(null, user)
                    }else{
                        return done(null, false, {message: "Invalid credentials"})
                    }
                })
            }
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user)
        })
    })

}