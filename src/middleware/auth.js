const async = require('hbs/lib/async');
const jwt = require('jsonwebtoken');

const Register = require('../models/user');

const auth = async (req,res,next) =>{
    try {
       console.log("work");
        const token = req.cookies.jwt;

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const curruser = await Register.findOne({email:verifyUser._id});

        req.token = token;
        req.curruser = curruser;
        
        next();
        
        
    } catch (error) {
        res.status (401).send(error);
       //res.render('/loginP');
    }


}

module.exports = auth;