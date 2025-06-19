const { Router } = require("express");
const User = require("../models/user")

const router = Router();


router.get("/login", (req, res) => {
    return res.render("login");
});
router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/login", async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const token = await User.matchPasswordGenerateToken(email, password);
        return res.cookie("token", token).redirect("/");
    }
    catch (error) {
        return res.render("login", {
            error: "Incorrect Email or Password",
        });
    }
});

router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;
    await User.create({
        fullName,
        email,
        password,
    });
    return res.redirect("/");
});

router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
})

module.exports = router;