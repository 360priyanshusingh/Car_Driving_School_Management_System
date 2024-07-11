const mongoose= require('mongoose')
const PaymentSchema=mongoose.Schema({

    remarks :{type:String },
    amount:{type:Number,required:true},
    date:{type:Date,default:Date.now},
    status:{type:String},
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

const PaymentModel=mongoose.model('Payment',PaymentSchema);

module.exports=PaymentModel;