const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const User = require("./models/user.js");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require('connect-flash');

const ExpressError = require("./ExpressError");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const PassportLocalMongoose = require("passport-local-mongoose");


main().then(() => {
    console.log("connection successful");
}).catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
app.use(session({secret: "supersecretcode", resave: false, saveUninitialized: true}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
})

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function wrapAsync(fn){
    return function(req, res, next){
        fn(req, res, next).catch((err) => next(err));
    }
}

// app.get("/demouser", wrapAsync(async(req, res) => {
//     let fakeUser = await User.create({
//         username: "Ritesh",
//         email: "ritesh@gmail.com",
//     });

//     const registerdUser = await User.register(fakeUser, "hello");
//     res.send(registerdUser);
// }));


//Signin Route
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", wrapAsync((req, res) => {
    let {username, email, password} = req.body;
    let newUser = new User({username, email});
    let registerdUser = User.register(newUser, password);
    req.flash("success", "User signed in!");
    res.redirect("/chats");
}));


//Login Route
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}), async(req, res) => {
    req.flash("success", "User logged in !");
    req.flash("error", "Please login properly");
    res.redirect("/chats");
});


app.get("/chats", wrapAsync(async(req, res) => {
    let chats = await Chat.find();
    res.cookie("greet", "Hello", { signed: true });
    res.render("index", {chats});
}));


//Create Route
app.get("/chats/new", (req, res) => {
    // throw new ExpressError(404, "Page not found");
    res.render("new");
});

app.post("/chats", wrapAsync(async(req, res) => {
    let {from, to, msg} = req.body;

   let newChat = new Chat({
      from : from,
      to: to,
      msg : msg,
      created_at: new Date(),
   })
    await newChat.save();
    req.flash("success", "chat is created !");
    res.redirect("/chats");
}));


//Show Route
app.get("/chats/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let chat = await Chat.findById(id);
    res.render("edit", {chat});
}));


//Edit Route
app.get("/chats/:id/edit", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let chat = await Chat.findById(id);
    res.render("edit", {chat});
}));

app.put("/chats/:id", wrapAsync(async(req, res) => {
       let {id} = req.params;
       let {msg: newMsg} = req.body;
       let updatedChat = await Chat.findByIdAndUpdate(id, {msg: newMsg}, {runValidators: true, new: true});
       req.flash("success", "You edit this Chat");
       res.redirect("/chats");
}));


//Delete Route
app.delete("/chats/:id", wrapAsync(async(req, res) => {
        let {id} = req.params;
        let deletedChat = await Chat.findByIdAndDelete(id);
        console.log(deletedChat);
        req.flash("success", "Chat is deleted !");
        res.redirect("/chats");
}));


app.get("/", (req, res) => {
   console.log(req.signedCookies);
    // res.send("Hi, I am root");
});

app.use((err, req, res, next) => {
    console.log(err.message);
    next(err);
})

//Error Handling Middleware
app.use((err, req, res, next) => {
    let {status=500, message="Something went wrong"} = err;
    res.status(status).send(message);
});


app.listen(3000, () => {
    console.log("server is listening on port 3000");
})
