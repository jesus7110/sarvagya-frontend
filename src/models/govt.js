const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const async = require('hbs/lib/async');
const jwt =require('jsonwebtoken');
const res = require('express/lib/response');

// schema--------------------------registration for doctor
const patientDSchema = new  mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    age : {
       type:Number,
       required:true
    },
    sex : {
       type:String,
       required:true
    },
    email : {
       type:String,
       required:true,
       unique:true
    },
    phone : {
       type:Number,
       required:true,
       unique:true
    },
    aadhar : {
       type:Number,
       required:true,
       
    },
    password : {
       type:String,
       required:true
    },
    tokens: [{
      token :{
         type:String,
         required:true
      }
   }]
  
})

//---------------token generation for work modulle for authentication-------
patientDSchema.methods.generateAuthToken = async function(){

   try{
      const token = jwt.sign({_id:this.email}, process.env.SECRET_WAY);
       this.tokens = this.tokens.concat({token:token})
      await this.save();

      return token;
   }
   catch (error){
      res.send('the error part' + error);
      console.log('the error part' + error);

   }
}
//--------------- incription of password---------------
patientDSchema.pre('save', async function(next){
   if(this.isModified('password')){
      console.log(`this password is ${this.password}`);
      this.password = await bcrypt.hash(this.password, 10);
      console.log(`this password is ${this.password}`);
   }
   
   next();
})


   // create a collection regarding your doctor registration

const registerD = new mongoose.model("Dregister",patientDSchema);

module.exports = registerD;