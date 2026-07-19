const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    // map function don't do any change in original array but it creates new array according to condition with the change.
    initData.data = initData.data.map((obj) => ({...obj , owner: "6a3ce96c065054ccb0a9bcfc"})); // here we use map function to assign owner property & keep all existing information of array as it is.
    await Listing.insertMany(initData.data);
    console.log("data was initiazed");
};

initDB();