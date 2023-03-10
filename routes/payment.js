var express = require('express');
var router = express.Router();
var USER_PREMIUM_COLLECTION=require("../models/USER_PREMIUM_COLLECTION");
var Razorpay=require("razorpay");
var crypto = require("crypto");
const moment=require("moment");


let instance = new Razorpay({
    key_id: 'rzp_live_G3qHxXevgtCMqN', // your `KEY_ID`
    key_secret: 'GtRmALeAp53dfgyvZA01EDBe' // your `KEY_SECRET`
  });

router.post("/order",(req,res)=>
{
        params=req.body;
        instance.orders.create(params)
        .then((data) => {
            res.send({sub:data,status:"success"});
        })
        .catch((error) => {
            res.send({sub:error,status:"failed"});
        })
});
    
router.post("/verify",async function(req,res)
{
    var response = {status:"failure"};
    try
    {
    let  body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var expectedSignature = crypto.createHmac('sha256', 'GtRmALeAp53dfgyvZA01EDBe').update(body.toString()).digest('hex');
    
    if(expectedSignature == req.body.razorpay_signature)
    {
        // if(!(req.body.Class && req.body.Course))
        // {
        //     res.send(`Payment Successful but you have not got the course. Your transacation ID is ${req.body.razorpay_order_id }`);
        //     return;
        // }

        let ExpiryDate=moment(new Date()).add(12, 'M');
        await USER_PREMIUM_COLLECTION.update({ EMAIL:req.user.EMAIL,CLASS_ID:req.body.Class,COURSE_ID:req.body.Course},{ TRIAL_FLAG:0,EXPIRY_DATE_TIME:ExpiryDate,EMAIL:req.user.EMAIL,CLASS_ID:req.body.Class,COURSE_ID:req.body.Course},{upsert: true, setDefaultsOnInsert: false});          
        
    //     let ObjUSER_PREMIUM_CO   LLECTION=new USER_PREMIUM_COLLECTION({
    //         TRIAL_FLAG:0,
    //         EXPIRY_DATE_TIME:ExpiryDate,
    //         EMAIL:req.user.EMAIL,
    //         CLASS_ID:"C3",//req.body.Class,
    //         COURSE_ID:"Maths",//req.body.Course
    // });

    //     await ObjUSER_PREMIUM_COLLECTION.save();



    response = {status:"success"};
    
    }
    res.send(response);
    return;
}
catch(err)
{
    res.send(response);
}
});


    module.exports=router;
  
  
