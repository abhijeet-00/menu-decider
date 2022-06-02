const mongoose=require("mongoose");

const itemSchema=new mongoose.Schema({
    itemName:{
        type:String
    },
    vote:{
        type:Number,
        default:0
    }
})

const Item=new mongoose.model("Item",itemSchema);
module.exports=Item;