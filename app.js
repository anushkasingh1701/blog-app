//libraries
require("dotenv").config()
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

//routers
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

//models
const Blog = require("./models/blog");

//middlewares
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // Adjust as necessary based on your function's structure
app.use(express.static(path.resolve("./public")))

app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({})  
    
    res.render("home", {
        user: req.user,
        blogs: allBlogs
    });
});


app.listen(PORT, () => console.log(`Server started at ${PORT}`));
