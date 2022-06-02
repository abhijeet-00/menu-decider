const mongoose=require("mongoose");

const voteSchema=new mongoose.Schema({
   
itemName:{
    type:String
},
rollno:{
    type:String
}

})

const Vote=new mongoose.model("Vote",voteSchema);

module.exports=Vote;
