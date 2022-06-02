const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const res = require("express/lib/response");

const studentSchema=new mongoose.Schema({
    firstname:{
        type:String,
        
    },
    lastname:{
        type:String,
       
    },
    
    rollno:{
        type:String,
     
      
    },
   
    password:{
        type:String,
      
    },
    confirmpassword:{
        type:String,
      
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

})

studentSchema.methods.generateAuthToken= async function(){
    try {
        const token=jwt.sign({_id:this._id.toString()},process.env.KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

studentSchema.pre("save", async function(next){
    if(this.isModified("password")){
       
        this.password= await bcrypt.hash(this.password,5);
        this.confirmpassword=undefined;
    }
    

    next();
})

const Register = new mongoose.model("Register",studentSchema);
module.exports=Register;