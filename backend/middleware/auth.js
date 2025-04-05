const jwt = require('jsonwebtoken')
const JWt_Secert = "asedadsf"
async function auth (req,res,next){
  const token = req.headers.autherziation ; 
  if(!token ){
    return res.status(401).json({
        message:"Doesn't get token"
    })
  }
  try {
      const user = jwt.verify(token,JWt_Secert);
      req.userId= user.user_id;
      next();
  }catch(error){
    console.log(error);
    res.json({
    error:"while middleware"
  })
  }
}
console.log("auth fun")
module.exports ={
  auth,
  JWt_Secert
}