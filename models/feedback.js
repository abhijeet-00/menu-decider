const mongoose=require("mongoose");

const feedbackSchema=new mongoose.Schema({
   
feedback:{
    type:String
}

})

const Feedback=new mongoose.model("Feedback",feedbackSchema);

module.exports=Feedback;
