const mongoose=require("mongoose")
const initData = require("./data.js")

const Listing=require("../models/listing.js");


//mongoose  connection

main().then(()=>{
    console.log("conection successfull")
})
.catch((err)=>{
    console.log(err)
})

 async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/Wonderland");
}



//to init data

const initDB = async () => {
    await Listing.deleteMany({});
    
    const dataWithOwner = initData.data.map((obj) => ({
        ...obj,
        owner: "6841434462826369d50915f8",
    }));
    
    await Listing.insertMany(dataWithOwner);
    console.log("Data is initialized");
};


//now calling the above function 
initDB();