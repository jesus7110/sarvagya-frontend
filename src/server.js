//************---------------------requiremants -----------------------------------************
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { stat, truncate } = require('fs');
const mongoose = require('mongoose')
const app = express()
const http = require('http').createServer(app)
const path = require('path');
const ejs= require('ejs');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const auth = require('./middleware/auth');
const dauth = require('./middleware/dauth');
// const curruser = require('./middleware/auth');
// var Puser = curruser;
// const passport  =require('passport');
// const localStrategy = require('passport-local').Strategy;

// const bodyParser = require('body-parser');
// console.log(Puser);


// ------------------------------connection to database ------------------------
require('./db/connect');

//-----------------------------models to aquire for schema---------------------
const Register = require("./models/user");
const DRegister = require("./models/govt");
const form = require("./models/event");

// ------------------------extended requiremnts------------------
const async = require('hbs/lib/async');
const { append, cookie } = require('express/lib/response');

const { json } =require('express');
const { send } = require('process');
const { Console, error } = require('console');


// ----------------------------port local host--------------------
const PORT = process.env.PORT || 4000;

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
//------------------path finder--------------------------
const static_path =path.join(__dirname,'../public');

const template_path =path.join(__dirname,'../templates/views');

const partial_path =path.join(__dirname,'../templates/partials');

const main_path =path.join(__dirname,'./com');
console.log(main_path);

//-----------------------------using express json file 
app.use(express.json());
//cookie parser--
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.use(express.static(main_path));
app.use(express.static(__dirname + ''))

// midleware
// app.use(
//     session({
//       secret: "verygoodsecret",
//       resave: false,
//       saveUninitialized: true,
//     })
//   );
//   app.use(bodyParser.urlencoded({ extended: false }));
//   app.use(bodyParser.json());

//------------------handlebars view engine---------------------------
app.set('view engine','ejs');
app.set('views',template_path);



// //------------------------------- Passport Js-----------------------
// app.use(passport.initialize());
// app.use(passport.session());
// //----serialization and deserialization-----------------
// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//   users.findById(id, function (err, user) {
//     done(err, user);
//   });
// });

// let currUser;
// //-----------passport checker------------------ for transfer of curr user to the module------
// passport.use(
//   new localStrategy(function (username, password, done) {
//     Register.findOne({email:username}, function (err, user) {
//       currUser = username;
//       if (err) return done(err);
//       if (!user) return done(null, false, { message: "Incorrect username." });

//       bcrypt.compare(password,user.password, function (err, res) {
//         if (err) return done(err);
//         if (res === false)
//           return done(
//             null,
//             false,
//             { message: "Incorrect password." },
//             console.log("Incorrect Password")
//           );

//         return done(null, user);
//       });
//     });
//   })
// );

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) return next();
//   res.redirect('login');
// }

// function isLoggedOut(req, res, next) {
//   if (!req.isAuthenticated()) return next();
//   res.redirect('/');
// }

// ------------------server ------register paths ------------------------------
app.get('/', (req,res)=>{
  res.render('mainpage')
});
app.get('/loginD', (req,res)=>{
  res.render('loginD')
});
app.get('/loginP', (req,res)=>{
  res.render('loginP')
});
app.get('/registerP', (req,res)=>{
  res.render('registerP')
});
app.get('/registerD', (req,res)=>{
  res.render('registerD')
});
app.get('/userd',auth, (req,res)=>{
  res.render('userd',{
    name:req.curruser.name,
  })
});
app.get('/form',auth, (req,res)=>{
  res.render('form')
});
app.post('/form',auth, async(req,res)=>{
  try{
    const formData = new form({
     Ename : req.body.name,
     State : req.body.Sname,
     Area : req.body.area,
     Pincode : req.body.pin,
     Landmark:req.body.mark,
     Date : req.body.date,
     Category : req.body.category,
     Problem : req.body.problem,
    })
      await formData.save();
    res.status(201).redirect('/userd');
  }catch (error) {
    res.status(400).send(error);
  }
});
app.get('/govtdash',dauth, (req,res)=>{
  res.render('govtdash')
});
app.get('/pending',dauth, async(req,res)=>{
  await form.find({},(err,foundForm)=>{
    if(!err){
      res.render('pending',{
        problem: foundForm
      })
    }else{
      res.send(err)
    }
  }).clone()
});
app.get('/solved',dauth, (req,res)=>{
  res.render('solved')
});


// deserialization---work - for -- working module
//------------------- logout work for patient--------------
app.get('/logout', auth , async(req,res) =>{
  try {
       req.curruser.tokens = req.curruser.tokens.filter((currElement) => {
         return currElement.token ===! req.token
        })
        res.clearCookie();
        console.log('logout successful');
        await req.curruser.save();
        res.render('mainpage');
    
  } catch (error) {
    res.status(500).send(error);
  }
});
//------------------- logout work for Doctor--------------
app.get('/logoutd', dauth , async(req,res) =>{
  try {
       req.currdoctor.tokens = req.currdoctor.tokens.filter((currElement) => {
         return currElement.token ===! req.dtoken
        })
        res.clearCookie();
        console.log('logout successful');
        await req.currdoctor.save();
        res.render('mainpage');
    
  } catch (error) {
    res.status(500).send(error);
  }
});


// ------------------server ------register paths **end**------------------------------

// creating a new database for patient registration===> in database
// creating a new database for patient registration===> in database
app.post('/register', async(req,res)=>{
  try{
      const USerData = new Register({
       name : req.body.pname,
       age : req.body.age,
       sex : req.body.sex,
       email : req.body.email,
       phone : req.body.phone,
       aadhar : req.body.aadhar,
       password : req.body.password,
      })

      const token =await USerData.generateAuthToken();
      console.log('the token part'+ token);
      
      res.cookie('jwt',token,{
        expires:new Date(Date.now()+6000000),
        httpOnly:true
      });

      console.log(cookie);

    const regiatered = await USerData.save();
    res.status(201).render('loginP');
  }
  catch(error){
      res.status(400).send(error);

  }
})
// creating a new database for doctor registration===> in database
app.post('/govt', async(req,res)=>{
  try{
      const DoctorRegister = new DRegister({
       name : req.body.dname,
       age : req.body.dage,
       sex : req.body.dsex,
       email : req.body.demail,
       phone : req.body.dphone,
       aadhar : req.body.daadhar,
       password : req.body.dpassword,
      })

      const token =await DoctorRegister.generateAuthToken();
      console.log('the token part'+ token);
      
      res.cookie('jwtd',token,{
        expires:new Date(Date.now()+6000000),
        httpOnly:true
      });

      console.log(cookie);

    const regiatered = await DoctorRegister.save();
    res.status(201).render('loginD');
  }
  catch(error){
      res.status(400).send(error);

  }
})
// checking patient login--------------> from database ------------------
app.post('/patient', async(req,res)=>{
   try{
         const email =req.body.email;
         const password =req.body.password;
    const useremail = await Register.findOne({email:email});

    const isMatch = await bcrypt.compare(password, useremail.password);
    
    const token =await useremail.generateAuthToken();
      console.log('the token part'+ token);
    
      res.cookie('jwt',token,{
        expires:new Date(Date.now()+600000),
        httpOnly:true,
        //secure:true
      });



    if(isMatch){
        res.status(202).redirect('/userd');
       
             
   }
    else{
       res.send("invalid password details");
   
   }
   }   
   catch(error){
     res.status(404).send("invalid login details");
    }
   });
// checking doctor login--------------> from database ------------------
app.post('/loginD', async(req,res)=>{
   try{
         const email =req.body.email;
         const password =req.body.password;
    const useremail = await DRegister.findOne({email:email});

    const isMatch = await bcrypt.compare(password, useremail.password);
    
    const token =await useremail.generateAuthToken();
      console.log('the token part'+ token);
    
      res.cookie('jwtd',token,{
        expires:new Date(Date.now()+600000),
        httpOnly:true,
        //secure:true
      });
   
    if(isMatch){
        res.status(202).redirect('/govtdash');
       
             
   }
    else{
      res.send("invalid password details");
   
   }
   }  
   
     
   catch(error){
    res.status(404).send("invalid login details");
    }
   });
//-------------------------------patient updation work--------------------
//-----------------------------------updation of patient info ---------------------

