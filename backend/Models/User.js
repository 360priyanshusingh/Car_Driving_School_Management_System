
const mongoose=require('mongoose')

const UserSchema= new mongoose.Schema({
  
  packageId:{
    type : mongoose.Schema.Types.ObjectId,
    ref:'Package',
  },  

  registrationId:{type:String,required:true},  
  name:{type:String, required:true},
  email:{type:String,required:true},
  gender:{type:String,required:true},
  address:{type:String,required:true},
  img:{type:String,required:true},
  contact:{type:String,required:true},
  lincenceNumber:{type:String,required:true},
  age:{type:String,required:true},
  alternateContact:{type:String,required:true},
  startDate:{type:String,required:true},
  traningTime:{type:String,required:true},
  status:{type:String,default:"Partial Payment"}

})

const UserModel=mongoose.model("User", UserSchema)
module.exports=UserModel;