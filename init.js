const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main().then(() => {
    console.log("connection successful");
}).catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}

let allChats = [
    {
        from : "Rohit",
        to : "ICT",
        msg : "garden main ghumega toh...",
        created_at : new Date(),
    },
    {
        from : "Virat",
        to : "Aus",
        msg : "Benstocks",
        created_at: new Date(),
    },
    {
        from : "Peter",
        to : "Zendeya",
        msg : "With great power comes great responsibility",
        created_at: new Date(),
    },
    {
        from : "Marvel fans",
        to : "IronMan",
        msg : "Love you 3000",
        created_at: new Date(),
    }
]

 Chat.insertMany(allChats);
