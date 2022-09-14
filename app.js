//loading modules
const express = require("express")
const handlebars = require("express-handlebars")
const mongoose = require("mongoose")
const app = express()
const admin = require("./routes/admin")
const users = require("./routes/user")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Post")
const Post = mongoose.model("posts")
require("./models/Category")
const Category = mongoose.model("categories")
const passport = require("passport")
require("./config/auth")(passport)

//configuration
//session
app.use(session({
    secret: "nodejs",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

//body-parser
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//handlebars
app.engine("handlebars", handlebars.engine({defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
      }}))
    app.set("view engine", "handlebars")

//public
app.use(express.static(path.join(__dirname, "public")))

//mongoose
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log("Connected to MongoDB...")
}).catch((err) => {
    console.log("Couldn't connect to database: " + err)
})

//routes
app.use("/admin", admin)
app.use("/users", users)

app.get("/", (req, res) => {
    Post.find().populate("category").sort({date: "desc"}).then((posts) => {
       res.render("index", {posts: posts}) 
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to load the posts feed: " + err)
        res.redirect("/404")
    })
})

app.get("/404", (req, res) => {
    res.send("Error 404!\nNot found")
})

app.get("/post/:slug", (req, res) => {
    Post.findOne({slug: req.params.slug}).then((post) => {
        if(post){
            res.render("post/index", {post: post})
        }else{
            req.flash("error_msg", "Post does not exist")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "An error has occured: " + err)
        res.redirect("/")
    })
})

app.get("/categories", (req, res) => {
    Category.find().then((categories) => {
        res.render("categories/index", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to load Categories page: " + err)
        res.redirect("/")
    })
})

app.get("/categories/:slug", (req, res) => {
    Category.findOne({slug: req.params.slug}).then((category) => {
        if(category){
            Post.find({category: category._id}).then((posts) => {
                res.render("categories/posts", {posts: posts, category: category})
            }).catch((err) => {
                req.flash("error_msg", "An error has occured while trying to load the page: " + err)
                res.redirect("/categories")
            })
        }else{
            req.flash("error_msg", "An error has occured while trying to load the page: " + err)
            res.redirect("/categories")
        }
    }).catch((err) => {
        req.flash("error_msg", "An error has occured while trying to load the page: " + err)
        res.redirect("/categories")
    })
})

//server
const port = 8080
app.listen(port, () => {
    console.log("Server running on port " + port + "...")
})