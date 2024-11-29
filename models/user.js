const {createHmac, randomBytes} = require('node:crypto');
const {Schema, model} = require("mongoose");
const {createTokenForUser} = require("../services/authentication")

const userSchema = new Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    salt:{
        type: String
    },
    password:{
        type: String,
        required: true
    },
    profileImageURL:{
        type: String,
        required: true,
        default: "/images/default.png"
    },
    enum:{
        type: String,
        enum:["USER", "ADMIN"],
        default:"USER"
    }
    
},{timestamps: true}
)

userSchema.pre("save", function(next){
    const user = this;
    if(!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
    
    next();
})

userSchema.static("matchPasswordAndCreateToken", async function(email, password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("user not found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");
    console.log(hashedPassword, userProvidedHash);

    if(hashedPassword !== userProvidedHash) throw new Error("incorrect password");

    const token = createTokenForUser(user);

    return token;


})

const User = model("user", userSchema);

module.exports = User;
