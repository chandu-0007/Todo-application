const mongoose = require('mongoose')
const ObjectId = mongoose.ObjectId;
const Schema = mongoose.Schema;
async function main(){
try {
  await mongoose.connect('mongodb+srv://ChandraSekhar:Chandu%40622005@cluster0.u9h7p.mongodb.net/todoApplication').then(()=>console.log("mongoose is conneted"))}
catch(e){
console.log(e)
}
}
console.log("connection aftere the line");
main();
const userSchema = new Schema({
   username :String ,
   email:String,
   password :String,
})
const todoschema = new Schema({
  userId:ObjectId,
  title:String ,
  timestamp:Date
})
const user = mongoose.model("users",userSchema);
const todo = mongoose.model("todos",todoschema);
console.log('models are also created without an error in the database file');
module.exports ={
  user,
  todo
}