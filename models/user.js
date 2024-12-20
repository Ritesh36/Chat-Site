const mongoose = require("mongoose");
const PassportLocalMongoose = require("passport-local-mongoose");


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:/27017/fakewhatsapp");
}

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(PassportLocalMongoose);

module.exports = mongoose.model("User", userSchema);