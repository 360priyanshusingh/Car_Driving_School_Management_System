const mongoose=require('mongoose')

const PackageSchema = new mongoose.Schema({

    name:{type:String , required : true},
    description:{type:String , required :true},
    price:{type : String,required:true },
    duration:{type:String,required:true },
});

const PackageModel=mongoose.model("Package", PackageSchema )

module.exports=PackageModel