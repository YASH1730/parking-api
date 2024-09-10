const JWT = require("jsonwebtoken");
const db = require("../connection/conn");
const bcrypt = require("bcrypt");

require("dotenv").config();

// middleware For Authentication

const Auth = (req, res, next)=> {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
  
    if (!token) {return res.status(403).send({
      status : 403,
      message : 'Not allowed to access this route.'
    });}
  
    JWT.verify(token, process.env.SECURE_KEY, (err, user) => {
      if (err) return res.status(403).send({status : 403 ,message:"Access Denied! Please Login."});
      req.user = user;
      req.token = token;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({status:500,message:"Something Went Wrong !"});
  }

  
};
const CheckUserCred = async (req,res,next)=>{
  try {
    let {userName, password, vehicle_no} = req.body;
    if( !userName || !password || !vehicle_no)
    return res.status(204).send({
    status : 204,
    message : "Missing Payload !!!"
    }) 
    // check the email already exists or not
    // req.body.email = email.toLowerCase().trim();
    // email = email.toLowerCase().trim();
    let check = await db('users')
    .where('vehicle_no',vehicle_no).first()

    // check the count 
    if(check){
      return res.status('203').send({
        status : 203,
        message : "User already exists (please enter the unique email and mobile)."
      })
    }
    else {
      //hash password
      req.body.password = await hashThePassword(password);
      next();
    }
  } catch (error) {
    console.log("Error >> ",error);
    return res.status(500).send({
      status : 500,
      message : "Something went wrong !!!"
    })
  }
}

// helper function 

async function hashThePassword(password){
  let secPassword = await bcrypt.hash(password, 10);
  return secPassword;
}
// async function count(email,mobile){
//   // let check = await db('users').where('email',email.toLowerCase().trim()).count('email as count');
//   let check = await db('users').count('* as count')
//   .where('email', email)
//   .orWhere('mobile', mobile)
//   console.log(check)
// } 

// count('yashwantsahu3002@gmail.com',8302043259)

  module.exports = {Auth,CheckUserCred};