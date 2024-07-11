const express = require('express')
const app = express();
const AdminModel = require("./Models/Admin")
const  jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto= require('crypto')
const cookieParser = require('cookie-parser')
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const connectDB= require("./config/db");
const path = require('path');
const cors = require('cors');
const PackageModel = require('./Models/Package');
const UserModel = require('./Models/User');
const { error } = require('console');
const multer = require('multer');
const EnquiryModel = require('./Models/Enquiry');
const PaymentModel = require('./Models/Payment');


// const { appendFile } = require('fs/promises');
app.use(express.json())

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
    }));

app.use(cookieParser());

app.use(express.static('backend/public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'backend/public/images')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage
})

dotenv.config();
connectDB();
// verifayuser

const verifyuser= async (req,res,next)=>{
    console.log(req.cookies)
    const token=req.cookies.jwtt;
    console.log(token)
    if(!token){
       return res.json({Error:"The token was not available"})
    }else{
     jwt.verify(token,"jwt-secret-key",(err,decoded)=>{
    if(err){
     console.error(err)
     return res.json({Error:"Token is  wrong"})
    }
    // console.log(decoded);
    req.role=decoded.role;
    req.id=decoded.id
    next()

   })

    }
}

// const verifyuser = async (req, res, next) => {
//     const token = req.cookies.token;
//     console.log("Token:", token);
//     if (!token) {
//         return res.status(401).json({ error: "Unauthorized: Token not provided" });
//     } else {
//         try {
//             const decoded = jwt.verify(token, "jwt-secret-key");
//             console.log("Decoded Token:", decoded);
//             req.user = decoded; // Attach decoded user information to the request object
//             next();
//         } catch (err) {
//             console.error("JWT Verify Error:", err);
//             return res.status(401).json({ error: "Unauthorized: Invalid token" });
//         }
//     }
// };

app.get('/home',verifyuser,(req,res)=>{
    return res.json({Status:"Success" , role:req.role , id:req.id})
})

// fuction fr Enuqiry


app.post('/createEnquiry', async(req,res)=>{
   
    const {name,email,number,discription} =req.body;

    EnquiryModel.create({name,email,number,discription}).
    then((result)=>{
        return res.status(200).json({message:"Enquiry SuccessFull Created",result})
    })
    .catch((err)=>{
        console.error(err)
        return res.status(200).json({message:"Enquiry Does Not SuccessFull Created"})
    })

})


app.get('/viewEnquiry',async(req,res)=>{
  EnquiryModel.find().
  then((result)=>{
    return res.status(200).json({Status:"Success" , result})
  })
  .catch((err)=>{
    return res.status(500).json({Status:"Unsuccess" , message:"Internal Server Error"})
  })
})


app.get('/view_Enquiry/:id',async(req,res)=>{
    const enquiryId=req.params.id;

    if(!mongoose.Types.ObjectId.isValid(enquiryId)){
        return res.status(300).json({Status:"Unsuccess" , message:"Invalid Enquiry id"})
    }
    EnquiryModel.findById(enquiryId).
    then((result)=>{
      return res.status(200).json({Status:"Success" , result})
    })
    .catch((err)=>{
      return res.status(500).json({Status:"Unsuccess" , message:"Internal Server Error"})
    })
  })


app.delete('/deleteEnquiry/:id',async(req,res)=>{
    const enquiryId=req.params.id;

    if(!mongoose.Types.ObjectId.isValid(enquiryId)){
        return res.status(300).json({Status:"Unsuccess" , message:"Invalid Enquiry id"})
    }
    EnquiryModel.findByIdAndDelete(enquiryId).
    then((result)=>{
      return res.status(200).json({Status:"Success" , message:"Enqury SuccesFully Deleted"})
    })
    .catch((err)=>{
      return res.status(500).json({Status:"Unsuccess" , message:"Internal Server Error"})
    })
})

app.put("/update_Enquiry/:id",async(req,res)=>{
    const enquiryId=req.params.id
    const { status } = req.body;
    
    if(!mongoose.Types.ObjectId.isValid(enquiryId)){
        return res.status(400).json({error:'Invalid User Id'})
    }
    EnquiryModel.findByIdAndUpdate(enquiryId,{ status })  
    .then((result)=>{
        return res.status(200).json({Status:"Success",message:"User Status Updated",result})
    })  
    .catch((err)=>{
        return res.status(500).json({Status:"Un success",message:"User Status not Updated"})
    })
})

app.get("/get_EnquiryCount", async(req,res)=>{

    try{
     const Enquirycount= await EnquiryModel.find({status:"unread"});
     res.status(200).json({message:"We find the unRead Enquiry",result:Enquirycount})
    }catch(err){
     console.log(err)
     res.status(500).json({error:"Backend Error or Internal Server Error"})
    }
 })
// fuction for users

app.post("/createUser", upload.single("img"), async (req, res) => {
    const img = req.file ? req.file.filename : null; // Changed variable name to avoid collision

    const { packageId, name, email, gender, address, // Clarify whether you want to use lincenceImage or img
        contact, lincenceNumber, age, alternateContact,
        startDate, traningTime } = req.body;

    const registrationId = crypto.randomBytes(3).toString('hex').toUpperCase();

    UserModel.create({
        packageId,
        registrationId,
        name,
        email,
        gender,
        address,
        img, // Use lincenceImageFileName instead of lincenceImage
        contact,
        lincenceNumber,
        age,
        alternateContact,
        startDate,
        traningTime
    })
    .then((user) => {
        res.status(200).json({ message: "User Successfully Created", user }); // Corrected typo in success message
    })           
    .catch((error) => {
        console.log(error);
        res.status(500).json({ error: "User Creation Failed - Backend or Server Error" }); // Improved error message
    });
});


app.get("/view_Users", async(req,res)=>{
    UserModel.find().
    populate("packageId","name").
    then((result)=>{
        res.json(result);
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).json({error:"Failed to fetching Users and Some other problem in backend"})
    })

} )

app.get("/get_User/:id",async(req,res)=>{
    const userId = req.params.id

    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error:"Invalid user Id"})
    }

    UserModel.findById(userId)
    .populate('packageId','name price duration description')
    .then((result)=>{
        if(!result){
            res.status(500).json({error:"User not found"})
        }
        else{
            res.status(200).json({Status:"Success",result})
        }
    })
    .catch((err)=>{
       console.error(err);
       res.status(500).json({error:"Failed to get user"})
    })
})

app.put("/update_user/:id",async(req,res)=>{
    const userId=req.params.id
    const { status } = req.body;
    
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({error:'Invalid User Id'})
    }
    UserModel.findByIdAndUpdate(userId,{ status })  
    .then((result)=>{
        return res.status(200).json({Status:"Success",message:"User Status Updated"})
    })  
    .catch((err)=>{
        return res.status(500).json({Status:"Un success",message:"User Status not Updated"})
    })
})

app.delete("/deleteUser/:id", async(req,res)=>{
    const userId= req.params.id

    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({error:"Invalid UsersId"})
    }

    UserModel.findByIdAndDelete(userId)
    .then(()=>{
        return res.status(200).json({ Status:"Success" ,message:"Users deleted"})
    })
    .catch((err)=>{
       console.error(err);
       return res.status(500).json({ Status:"Un Success" ,message:"Users not deleted and internal server error"})
    })

} )

app.post("/get_UserbyId", async(req,res)=>{
  const { start ,end}= req.body;

  UserModel.find({startDate:{
    $gte: start, 
   $lte: end 
  }}).
  populate("packageId","name")
  .then((result)=>{
    if(!result){
        return res.status(300).json({message:"No date between two date"})
    }
    else{
        return res.status(200).json({message:" Date between two date",result})
    }
  })
  .catch((err)=>{
    return res.status(500).json({error:"Internal server error"})
  })

})
app.get("/get_UserCount", async (req, res) => {
    try {
        const users = await UserModel.find({ status: "Partial Payment" });
        res.json({ message: "Successfully found users", result: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Unable to retrieve users", err });
    }
});


// fuction for Payment
app.post("/createPayment", async(req,res)=>{
    const {remarks,amount,date,status,userId} =req.body;
    PaymentModel.create({remarks,amount,date,status,userId})
    .then(result=>res.status(200).json({Status:'Success',result}))
    .catch(err=>res.status(500).json({error:"package creation failed"}))
} )

app.get("/get_Payment/:id",async(req,res)=>{
    const userId = req.params.id

    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(404).json({error:"Invalid user Id"})
    }

    PaymentModel.find({userId:userId})
    .then((result)=>{
        if(!result){
            res.status(500).json({error:"User not found"})
        }
        else{
            res.status(200).json({Status:"Success",result})
        }
    })
    .catch((err)=>{
       console.error(err);
       res.status(500).json({error:"Failed to get user"})
    })
})

// Fuction for Packages

app.post("/createPackage", async(req,res)=>{
    const {name,description,price,duration} =req.body;
    PackageModel.create({name,description,price,duration})
    .then(package=>res.json(package))
    .catch(err=>res.status(500).json({error:"package creation failed"}))
} )

app.get("/view_Package", async(req,res)=>{
  PackageModel.find().
  then(package=>{
    res.json(package);
  }).
  catch(err=>{
    console.error(err);
    res.status(500).json({error :"Failed to fach packages"})
  })
})

app.get("/get_Package/:id",async(req,res)=>{
     const packageId=req.params.id; 

    if(!mongoose.Types.ObjectId.isValid(packageId)){
        return res.status(400).json({error :"Invalid package ID."})
    }

    PackageModel.findById(packageId).
    then((package)=>{
        if(!package){
            return res.status(404).json({error:"Package not found"})
        }
        res.status(200).json({Staus : 'Success',package});
    })
    .catch(err=>{
        console.error(err);
        res.status(500).json({error:"failed to Package"})
    })

} )

app.put('/updatePackage/:id',async(req,res)=>{
    const packageId=req.params.id;
    const {name,description,price,duration}=req.body;

    if(!mongoose.Types.ObjectId.isValid(packageId)){
        return res.status(400).json({error:'Invalid doctor Id'})
    }

    PackageModel.findByIdAndUpdate(packageId,
        {
            name:name,
            description:description,
            price:price,
            duration:duration
        },
        {new:true}
        ).then((updatePackage)=>{
          if(!updatePackage){
            return res.status(404).json({error:'Package not found'})
          }
          else{
            return res.status(200).json({Status :'Succes' ,updatePackage})
          }
        }).catch((err)=>{
            console.error(err);
            res.status.json({error:'Failed to Updated Package'})

        })
})

app.delete('/deletePackage/:id' , async(req,res)=>{
    const packageId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(packageId)){
        return res.status(400).json({error:'Invalid doctor Id'})
    }
    
    PackageModel.findByIdAndDelete(packageId)
    .then((result)=>{
        if(!result){
            return res.status(404).json({error:"Package not found ."})
        }
        res.status(200).json({Status:"Success" ,message :"Packge deleted successfully"})
    }).catch((err)=>{
        console.error(err)
        res.status.json({error:"Failed to delete the package"})
    })

} )

app.get("/get_PackageCount", async(req,res)=>{
    try{
     const Packagecount= await PackageModel.countDocuments();
     res.status(300).json({Number:Packagecount})
    }catch(err){
     console.log(err)
     res.status(500).json({error:"Backend Error or Internal Server Error"})
    }
 })
// fuctions for admins

app.post("/login",async (req,res)=>{
    const { email , password } = req.body
    AdminModel.findOne({email:email})
    .then(user=>{
    if(!user){
        return res.status(404).json({error :"User Not Found." })
     }
    if(password !== user.password){
        return res.status(401).json({error : "Incorrect Password" })
     }

     const token = jwt.sign(
        { role : 'admin',id:user._id, email : user.email },
        "jwt-secret-key",
        { expiresIn:"1d" }
     )

     res.cookie('jwtt',token);
     console.log(token)
    //  console.log(req.cookies)
     res.json({message :"Login successfull",token});
    })
    .catch(err =>{
     console.error(err);
     res.status(500).json({error : "Database error"});   
    })  
}) 

app.get('/logout', (req, res) => {
  res.clearCookie('jwtt');
  console.log(req.cookies)
  return res.json( {Status: 'Logout successful'});
});

app.get("/",(req,res)=>{
    res.send("api started from Priyanshu 6000 port ")
})

app.put('/changePassword', verifyuser, async(req, res) => {
    const userId = req.id;
    console.log("userId", userId)
    const { currentPassword, newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
  
    AdminModel.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }
        // Compare the provided current password with the stored password
        if (currentPassword != user.password) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
  
        // Update the user's password with the new password
        user.password = newPassword;
        user.save()
          .then(() => {
            // Password changed successfully
            res.status(200).json({ message: 'Password changed successfully' });
          })
          .catch((saveErr) => {
            console.error(saveErr);
            res.status(500).json({ error: 'User update failed.' });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Password change failed.' });
      });
  });

//   app.put('/changePassword', verifyuser, async (req, res) => {
//     const userId = req.id; // Using req.user to access decoded user information

//     const { currentPassword, newPassword } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({ error: 'Invalid user ID.' });
//     }

//     try {
//         const user = await AdminModel.findById(userId);

//         if (!user) {
//             return res.status(404).json({ error: 'User not found.' });
//         }

//         // Compare the provided current password with the stored password
//         const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
//         if (!isPasswordValid) {
//             return res.status(400).json({ error: 'Current password is incorrect.' });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update the user's password with the new hashed password
//         user.password = hashedPassword;
//         await user.save();

//         // Password changed successfully
//         res.status(200).json({ message: 'Password changed successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Password change failed.' });
//     }
// });  
// fuction for search

app.post('/search',(req,res)=>{
    const {regiId}=req.body
    UserModel.find({registrationId:regiId})
    .populate("packageId","name")
    .then((result)=>{
       res.status(200).json({message:"User Succesfully Searched" ,result})
    })
    .catch((err)=>{
        console.error(err);
     res.status(500).json({message:"User not Succesfully Searched"})
    })
})

const PORT = process.env.PORT || 5000; // Use port 443 for HTTPS


app.listen(PORT, () => {
    console.log(`Server start at PORT ${PORT}`);
});