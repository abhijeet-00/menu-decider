const jwt=require("jsonwebtoken");
const Register=require("../models/students");


const auth = async (req,res,next)=>{
try {
    
const token=req.cookies.jwt;
const verifyUser=jwt.verify(token, process.env.KEY);

const user=await Register.findOne({_id:verifyUser._id});

req.token=token;
req.user=user;
next();

} catch (error) {
    console.log(error);
  return  res.status(401).send(error);
}
}
module.exports = auth;