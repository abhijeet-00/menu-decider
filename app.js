
require('dotenv').config()
const express=require("express");
const ejs=require("ejs");
const bodyParser = require("body-parser");
const cookieParser=require("cookie-parser");
const bcrypt=require("bcrypt");
const auth=require("./middleware/auth");
require("./db/conn");
const Register=require("./models/students");
const Item=require("./models/items");
const Vote=require("./models/vote");
const Feedback=require("./models/feedback");
const { application } = require('express');
const { default: mongoose } = require('mongoose');
const saltRounds=4;

var name="";
var voterollno="";
const app=express();

app.set('view engine','ejs')
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static("public"));
const port = process.env.PORT || 3000;


app.get("/",function(req,res){
res.render("index.ejs");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/incharge",function(req,res){
    res.render("incharge");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/studentfeedback",function(req,res){
          res.render("studentfeedback",{studentName:name});
})

app.get("/messmenu",auth ,(req,res)=>{
   Item.find({}).sort({ vote: 'desc' }).limit(10).exec(function(err, docs) {
       if(!err){
        res.render("messmenu",{studentName:name,allitems:docs});
       }
  
    });
   
})
app.get("/inchargefeedback",(req,res)=>{
    
    Feedback.find(function(err,allFeedbacks){
        if(!err){
          res.render("inchargefeedback",{allFeedbacks:allFeedbacks});
        }
      })
})
app.get("/allitems",(req,res)=>{
    
    Item.find(function(err,allItems){
        if(!err){
          res.render("allitems",{allitems:allItems});
        }
      })
})
app.get("/about",(req,res)=>{
    
    res.render("about");
})
app.get("/vote",function(req,res){
    Item.find(function(err,voteItems){
        
        if(!err){
          res.render("vote",{studentName:name,voteitems:voteItems});
        }
      })
})
app.get("/studenthome",function(req,res){
    res.render("studenthome",{studentName:name});
})
app.get("/logout",auth,async (req,res)=>{
    try {
        res.clearCookie("jwt");
        await req.user.save();
        res.redirect("/")
    } catch (error) {
        res.status(500).send(error);
    }
})
app.get("/additems",function(req,res){
    res.render("additems");
})

app.get("/contact",function(req,res){
    res.render("contact");
})
app.get("/notregistered",function(req,res){
    res.render("notregistered");
})
app.get("/notregister",(req,res)=>{
    res.render("notregister");
})
app.get("/filldetails",(req,res)=>{
    res.render("filldetails");
})
app.get("/studentexists",(req,res)=>{
    res.render("studentexists");
})
app.get("/password",(req,res)=>{
    res.render("password");
})
app.get("/invalid",(req,res)=>{
    res.render("invalid");
})
app.get("/voted",(req,res)=>{
    res.render("voted");
})
app.post("/incharge",function(req,res){
    const username=process.env.INCHARGE;
    
    const password=process.env.PASSWORD;
    if(req.body.username===username && req.body.password===password){
        res.render("additems");
    }
    else{
        res.redirect("/invalid");
    }
})
app.post("/register",async function(req,res){
    
  const {fname,lname,rollno,password,cpassword}=req.body;  

    var details=true,flag=true;
    if(!fname ||  !lname || !password || !cpassword || !rollno){
        details=false;
        res.redirect("/filldetails");
    }
    
      Register.findOne({rollno:rollno})
        .then((userExist)=>{
            if(userExist){
                flag=false;
                res.status(404).redirect("/studentexists") ;
            }
        })
            try {
                if(password===cpassword){
                   
                    const registerStudent=new Register({
                        firstname:req.body.fname,
                        lastname:req.body.lname,
                        rollno:req.body.rollno,
                        password:req.body.password,
                        confirmpassword:req.body.cpassword  
                })
                const token=await registerStudent.generateAuthToken();
                
                res.cookie("jwt",token,{
                    expires:new Date(Date.now()+50000),
                    httpOnly:true
                });
                 registerStudent.save();
                
                res.status(201).render("login");
                }
                else{
                    res.redirect("/password");
                   }
            } catch (error) {
                if(flag==true && details==true)
                res.status(400).send(error);
            }

               
      
    
})
app.post("/login",async function(req,res){
    
    const rollno=req.body.rollno;
    const password=req.body.password;
    var flag=true;
    Register.exists({rollno:rollno}, function (err, doc) {
        if(doc===null){
            flag=false;
            res.status(404).redirect("/notregister"); 
        }
     });
   
        try {
       
            const studentRoll=await Register.findOne({rollno:rollno});
    
            const isMatch= await bcrypt.compare(password,studentRoll.password); 
            const token=await  studentRoll.generateAuthToken();
           
            res.cookie("jwt",token,{
              expires:new Date(Date.now()+600000),
              httpOnly:true
            });
             name=studentRoll.firstname;
             voterollno=studentRoll.rollno;
             
          if(isMatch){
              res.render("studenthome",{studentName:name});
          }
          else{
              res.redirect("/invalid");
          }
      
     } catch (error) {
         if(flag==true)
         res.status(400).send(error);
     }
    
    
   
})
app.post("/studentfeedback",function(req,res){
    const feedback=req.body.feedback;
    const newFeedback=new Feedback({
        feedback:feedback
    })
    newFeedback.save();
    res.redirect("/studentfeedback");
})
app.post("/additems",function(req,res){
    const itemName=req.body.item;
    if(itemName[0]!=' '){
        const newItem=new Item({
            itemName:itemName
        })
        newItem.save();
    }
   
    res.redirect("/additems");
})

app.post("/vote",function(req,res){

    const itemName=req.body.name;
    var voted=false;

        Vote.find({itemName:itemName},function(err,docs){
            var flag=false;
           if(!err){
               docs.forEach(function(element){
                   if(element.rollno==voterollno){
                       voted=true;
                      flag=true;
                   }
               })

               if(flag===false){
                const newVote=new Vote({
                    itemName:itemName,
                    rollno:voterollno
                })
                newVote.save();
            }
            else{
                return res.redirect("/voted");
            }
          
           }  
         
            else{
                const newVote=new Vote({
                    itemName:itemName,
                    rollno:voterollno
                })
                newVote.save();
            }
            if(voted===false){
                Item.findOne({itemName:itemName}, function (err, docs) {
                    if (!err){
                        Item.updateOne({itemName:itemName}, 
                            {vote:docs.vote+1}, function (err, docs) {
                           if(!err){
                            res.redirect("/vote");
                           }
                        });
                    }
                });
            }
            else{
                res.redirect("/vote");
            }
        })

})

app.get("*",(req,res)=>{
    res.render("404");
})
app.get("/login/*",(req,res)=>{
    res.render("404");
})

    app.get("/register/*",function(req,res){
        res.render("404");
    })
    app.get("/incharge/*",function(req,res){
        res.render("404");
    })
    
    app.get("/studentfeedback",function(req,res){
        res.render("404");
    })
    
    app.get("/messmenu/*",auth ,(req,res)=>{
        res.render("404");
       
    })
    app.get("/inchargefeedback/*",(req,res)=>{
        
        res.render("404");
    })
    app.get("/allitems/*",(req,res)=>{
        
        res.render("404");
    })
    app.get("/about/*",(req,res)=>{
        
        res.render("404");
    })
    app.get("/vote/*",function(req,res){
        res.render("404");
    })
    app.get("/studenthome/*",function(req,res){
        res.render("404");
    })
   
    app.get("/additems/*",function(req,res){
        res.render("404");
    })
    
    app.get("/contact/*",function(req,res){
        res.render("404");
    })
    app.get("/notregistered/*",function(req,res){
        res.render("404");
    })
    app.get("/notregister/*",(req,res)=>{
        res.render("404");
    })
    app.get("/filldetails/*",(req,res)=>{
        res.render("404");
    })
    app.get("/studentexists/*",(req,res)=>{
        res.render("404");
    })
    app.get("/password/*",(req,res)=>{
        res.render("404");
    })
    app.get("/invalid/*",(req,res)=>{
        res.render("404");
    })
app.listen(port,function(req,res){
    console.log(`Server is running at port ${port}`);
})