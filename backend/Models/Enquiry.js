const mongoose=require("mongoose")

const EnquirySchem= new mongoose.Schema({ 
    name:{type:String, required:true},
    email:{type:String, required:true},
    number:{type:String, required:true},
    discription:{type:String, required:true},
    status:{type:String,  default:"unread" },
})

const EnquiryModel= mongoose.model('Enquiry',EnquirySchem)

 module.exports=EnquiryModel;

