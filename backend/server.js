const express = require('express');
const jwt = require('jsonwebtoken');
const { user, todo } = require('../backend/database/db');
const { auth, JWt_Secert } = require("../backend/middleware/auth");
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { error } = require('console');
const { title } = require('process');
const port = 3000;
const app = express();

app.use(express.json());

const userObject = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email('invalid email'),
    password: z.string().min(8, 'at least 8 characters')
        .max(15, 'Too large password')
        .regex(/[A-Z]/, 'at least one uppercase letter')
        .regex(/[\W_]/, 'at least one special character')
});

app.post("/signup", async (req, res) => {
    console.log(req.body);  

    const { username, email, password } = req.body;

    try {
        const validUser = userObject.parse({
            username,
            email,
            password
        });

        if (validUser) {
            const findUser = await user.findOne({ username, email })
            if (!findUser) {
                const hashedPassword = await bcrypt.hash(password, 5);
                const newUser = await user.create({
                    username: username,
                    email: email,
                    password: hashedPassword
                });

                console.log(newUser);
                return res.json({
                    message: "User has successfully signed up"
                });
            } else {
                return res.json({
                    message: "The username or email already exists"
                });
            }
        }
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }
});

app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const findUser = await user.findOne({ username });

        if (!findUser) {
            return res.json({
                message: "The user is not found in the database"
            });
        }

        const success = await bcrypt.compare(password, findUser.password);
        const user_id = findUser._id;
        if (success) {
            const token = jwt.sign({user_id}, JWt_Secert);

            return res.status(200).json({
                message: "Successfully logged in",
                token: token
            });
        } else {
            return res.status(401).json({
                message: "Invalid password or username"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});
app.use(auth);
app.post("/addtodo", async (req,res)=>{
   const userId = req.userId;
   console.log(userId);
   const todoName = req.body.todoName;
   const todoobject = z.string();
   const value = todoobject.parse(todoName);
   if(value){
   try{
     await todo.create({
        userId:userId,
        title: todoName , 
        timestamp:Date.now()
     });
     res.status(200).json({
        success:true,
        message:"succesfully added todo"
     })
   }catch(e){
    console.log(error)
     return res.status(401).json({
        success:false,
        message:"something got error at while adding todo"
     })
   }}else{
    return res.json({
        success:false,
        message:"Please enter the valid todo"
    })
   }
})
app.get("/gettodos",async (req,res)=>{
    if(!req.userId){
        return res.status(401).send({
            success:false,
            message:"Didn't get he userId"
        })
    }
    try{
      const todos = await todo.find({userId:req.userId})
      if(todos.length === 0) {
        return res.json({
            message:'there no todos for this user '
        })
      }
      res.status(200).json({
        message:"your todos",
        todos:todos
      })
    }catch(error){
      console.log(error);
      res.send("faild the server while fectching todos ")
    }
})
app.delete('/deletetodo',async (req,res)=>{
    const todoName = req.body.todoName;
    const findtodo = await todo.findOne({title : todoName , userId:req.userId});
    if(!findtodo){
        return res.status(400).json({
            message:"Dosn't find todo in the todo database "
        })
    }
    try{
      await todo.findOneAndDelete({_id:findtodo._id})
        console.log('the todo is deleted ');
        res.status(200).json({
            success:true,
            message:'successfully deleted todo from the database '
        })
      
    }catch(e){
      console.log(e);
      return res.status(400).json({
        message:"error at while deleting "
      })
    }
    
})
app.put('/updatetodo',async (req,res)=>{
    const todoName = req.body.todoName;
    const updatetodo = req.body.updatetodo; 
    const findtodo = await todo.findOne({title : todoName , userId:req.userId});
    if(!findtodo){
        return res.status(400).json({
            message:"Dosn't find todo in the todo database "
        })
    }
    try{
      await todo.findOneAndUpdate({_id:findtodo._id},{$set:{title:updatetodo}})
        console.log('the todo is updated  ');
        res.status(200).json({
            success:true,
            message:'successfully updated todo from the database '
        })
      
    }catch(e){
      console.log(e);
      return res.status(400).json({
        message:"error at while updating  "
      })
    }
    
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
