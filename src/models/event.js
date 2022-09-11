const mongoose = require('mongoose');

// schema--------------------------registration for doctor
const EventDetail = new  mongoose.Schema({
    Ename : {
        type:String,
        required:true
    },
    State : {
       type:String,
       required:true
    },
    Area : {
       type:String,
       required:true
    },
    Pincode : {
       type:Number,
       required:true,
       
    },
    Landmark:{
      type:String,
    },
    Date : {
       type:Date,
       required:true,
       
    },
    Category : {
       type:String,
       required:true,
       
    },
    Problem : {
       type:String,
       required:true
    },
    
})

  // create a collection regarding your event

  const form = new mongoose.model("detail",EventDetail);

  module.exports = form;