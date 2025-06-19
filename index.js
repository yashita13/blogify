require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkAuthenticationCookie } = require("./middlewares/authentication");

// console.log("My name is:", process.env.myname);

const app = express();
const PORT = process.env.PORT || 8005;

//mongodb://localhost:27017/blogify
mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB connected!"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthenticationCookie("token"));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(express.static(path.resolve("./public")));


app.get("/", async (req, res) => {
    console.log("req.user:", req.user);         // log user injected by middleware
    console.log("res.locals.user:", res.locals.user); // if you already set it in middleware

    const allBlogs = await Blog.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));

//for deploying on AWS, index=app.js

//mongodb+srv://yashitabahrani:YourPasswordHere@cluster0.gvcuuu0.mongodb.net/blogify?retryWrites=true&w=majority&appName=Cluster0