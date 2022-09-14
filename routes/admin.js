const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Category")
const Category = mongoose.model("categories")
require("../models/Post")
const Post = mongoose.model("posts")
const {isAdmin} = require("../helpers/isAdmin")

router.get("/categories", isAdmin, (req, res) => {
    Category.find().then((categories) => {
        res.render("admin/categories", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to list the categories")
        res.redirect("/admin")
    })
})

router.get("/categories/add", isAdmin, (req, res) => {
    res.render("admin/add")
})

router.post("/categories/new", isAdmin, (req, res) => {
    var errors = []
    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Invalid name"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: "Invalid slug"})
    }

    if(errors.length > 0){
        res.render("admin/add", {errors: errors})
    }
    else{
        const newCategory = {
            name: req.body.name,
            slug: req.body.slug
        }
    
        new Category(newCategory).save().then(() => {
            req.flash("success_msg", "Category added successfully")
            res.redirect("/admin/categories")
        }).catch((err) => {
            req.flash("error_msg", "An error has occured while trying to add the category")
            res.redirect("/admin")
        })
    }
})

router.get("/categories/edit/:id", isAdmin, (req, res) => {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render("admin/edit", {category: category})
    }).catch((err) => {
        req.flash("error_msg", "This category does not exist")
        res.redirect("/admin/categories")
    })
})

router.post("/categories/edit", isAdmin, (req, res) => {
    var errors = []
    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Invalid name"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: "Invalid slug"})
    }

    if(errors.length > 0){
        //res.render("admin/edit/:id", id = req.body.id {errors: errors})
        req.flash("error_msg", "Couldn't edit category")
        res.redirect("/admin/categories")
    }
    else{
        Category.findOne({_id: req.body.id}).then((category) => {
            category.name = req.body.name,
            category.slug = req.body.slug
            category.save().then(() => {
                req.flash("success_msg", "Category edited successfully")
                res.redirect("/admin/categories")
            }).catch((err) => {
                req.flash("error_msg", "An internal error has occured while trying to edit the category")
                res.redirect("/admin/categories")
            })
        }).catch((err) => {
            req.flash("error_msg", "An error has occured while trying to edit the category")
            res.redirect("/admin")
        })
    }
})

router.post("/categories/delete", isAdmin, (req, res) => {
    Category.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Category deleted successfully")
        res.redirect("/admin/categories")
    }).catch((err) => {
        req.flash("error_msg", "An error occured while trying to delete category")
        res.redirect("/admin/categories")
    })
})

router.get("/posts", isAdmin, (req, res) => {
    Post.find().populate({path: "category", strictPopulate: false}).sort({date: "desc"}).then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to load the feed: " + err)
        res.redirect("/admin")
    })
})

router.get("/posts/add", isAdmin, (req, res) => {
    Category.find().then((categories) => {
        res.render("admin/addpost", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to load the form: " + err)
        res.redirect("/admin")
    })
})

router.post("/posts/new", isAdmin, (req, res) => {
    var errors = []
    if(!req.body.title || typeof req.body.title == undefined || req.body.title == null){
        errors.push({text: "Invalid title"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: "Invalid slug"})
    }

    if(!req.body.description || typeof req.body.description == undefined || req.body.description == null){
        errors.push({text: "Invalid description"})
    }

    if(!req.body.content || typeof req.body.content == undefined || req.body.content == null){
        errors.push({text: "Invalid content"})
    }

    if(req.body.category == "0"){
        errors.push({text: "Invalid category, register a category"})
    }

    if(errors.length > 0){
        Category.find().then((categories) => {
            res.render("admin/addpost", {categories: categories, errors: errors})
        })
    }
    else{
        const newPost = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }
    
        new Post(newPost).save().then(() => {
            req.flash("success_msg", "Post created successfully")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "An error has occured while trying to create the post")
            res.redirect("/admin")
        })
    }
})

router.get("/posts/edit/:id", isAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).then((post) => {
        Category.find().then((categories) => {
            res.render("admin/editpost", {categories: categories, post: post})
        }).catch((err) => {
            req.flash("error_msg", "An internal error has occured while trying to edit the post: " + err)
            res.redirect("/admin/posts")
        })
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to edit the post: " + err)
        res.redirect("/admin/posts")
    })
    
})

router.post("/posts/edit", isAdmin, (req, res) => {
    var errors = []
    if(!req.body.title || typeof req.body.title == undefined || req.body.title == null){
        errors.push({text: "Invalid title"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: "Invalid slug"})
    }

    if(!req.body.description || typeof req.body.description == undefined || req.body.description == null){
        errors.push({text: "Invalid description"})
    }

    if(!req.body.content || typeof req.body.content == undefined || req.body.content == null){
        errors.push({text: "Invalid content"})
    }

    if(req.body.category == "0"){
        errors.push({text: "Invalid category, register a category"})
    }

    if(errors.length > 0){
        //res.render("admin/edit/:id", id = req.body.id {errors: errors})
        req.flash("error_msg", "Couldn't edit post")
        res.redirect("/admin/posts")
    }
    else{
        Post.findOne({_id: req.body.id}).then((post) => {
            post.title = req.body.title,
            post.slug = req.body.slug,
            post.description = req.body.description,
            post.content = req.body.content,
            post.category = req.body.category
            post.save().then(() => {
                req.flash("success_msg", "Post edited successfully")
                res.redirect("/admin/posts")
            }).catch((err) => {
                req.flash("error_msg", "An internal error has occured while trying to edit the post")
                res.redirect("/admin/posts")
            })
        }).catch((err) => {
            req.flash("error_msg", "An error has occured while trying to edit the post")
            res.redirect("/admin/posts")
        })
    }
})

router.get("/posts/delete/:id", isAdmin, (req, res) => {
    Post.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Post deleted successfully")
        res.redirect("/admin/posts")
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to delete the post: " + err)
        res.redirect("/admin/posts")
    })
})

module.exports = router