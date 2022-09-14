const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/User")
const User = mongoose.model("users")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/register", (req, res) => {
    res.render("users/register")
})

router.post("/register", (req, res) => {
    var errors = []
    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Invalid name"})
    }
    
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({text: "Invalid email"})
    }

    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        errors.push({text: "Password cannot be empty"})
    }

    if(req.body.password.length < 8){
        errors.push({text: "Password must have at least 8 characters"})
    }

    if(req.body.password != req.body.password2){
        errors.push({text: "Passwords do not match"})
    }

    if(errors.length > 0){
        res.render("users/register", {errors: errors})
    }else{  
        User.findOne({email: req.body.email}).then((user) => {
            if(user){
                req.flash("error_msg", "This email is already in use")
                res.redirect("/users/register")
            }else{
                const newUser = {
                    name: req.body.name, 
                    email: req.body.email, 
                    password: req.body.password
                }

                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if(error){
                            req.flash("error_msg", "An error has occured during registration: " + error)
                            res.redirect("/users/register")
                        }else{
                            newUser.password = hash

                            new User(newUser).save().then(() => {
                                req.flash("success_msg", "User created successfully")
                                res.redirect("/")
                            }).catch((err) => {
                                req.flash("error_msg", "An error has occured while trying to create the user: " + err)
                                res.redirect("/users/register")
                            }) 
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "An error has occured while trying to verify the email address")
            res.redirect("/users/register")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login", 
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect("/")
    })
})

module.exports = router