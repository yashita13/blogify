const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    //to hash password, we use salt and pepper hash
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: "/images/default.png",
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User",
    },
}, { timestamps: true }
);

userSchema.pre("save", function (next) {    //mongoose save pre
    const user = this;      //no arrow fn, (only normal fn.) since this keywod is used

    if (!user.isModified("password")) return;

    //script / hash the password -> crypto hash nodejs
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static("matchPasswordGenerateToken", async function (email, password) {
    //fn. name = matchPassword
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest("hex");

    if (hashedPassword !== userProvidedHash) throw new Error("Invalid Password")

    const token = createTokenForUser(user);
    return token;
})

const User = model("user", userSchema);

module.exports = User;