const mongoose = require("mongoose");

const connectDatabase =( )=>{

    mongoose.connect("mongodb+srv://mohit:1234@cluster0.pp6xsgb.mongodb.net/thirdEssential",{useNewUrlParser:true
    }).then((data)=>{
        console.log(`mongodb connected with server : ${data.connection.host}`)
    }
    );
}

module.exports = connectDatabase
