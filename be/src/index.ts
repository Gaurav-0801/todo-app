import express from "express";
import {PrismaClient} from "@prisma/client"
import  jwt  from "jsonwebtoken";
import todoRoutes from "./routes/todo";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const JWT_SECRET = process.env.JWT_PASSWORD!; 
const app=express();
const prisma=new PrismaClient();
app.use(express.json());
app.use(cors())
app.post("/signup",async (req,res)=>{
    const username=req.body.username;
    const email=req.body.email;
    const password=req.body.password;
    try{
        const user=await prisma.user.create({
            data:{
                username,
                email,
                password
            }
        })
        res.json({
        message:"User created",
        user:user.id
        
    })
    }catch(e){
        return res.status(400).json({
            message:"User already exists"
        })
    }
    
})

app.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await prisma.user.findFirst({
            where: {
                email,
                password
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET
        );

        res.json({
            message: "User signed in",
            token
        });

    } catch (e) {
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

app.use("/todo",todoRoutes);
app.listen(3000)