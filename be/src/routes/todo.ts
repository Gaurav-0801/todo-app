import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../middleware";
import dotenv from "dotenv"; 
dotenv.config(); 
const route=Router();
const prisma=new PrismaClient()
route.post("/",authenticate,async (req,res)=>{
    const tasks=req.body.tasks;
    const done=req.body.done;
    const userId=(req as any).user.userId;
    try{
        const newTasks=await prisma.todo.create({
            data:{
                tasks,
                done,
                user:{
                    connect:{
                        id:userId
                    }
                } 
            }
        })
        res.json({
                    message:"Todo create",
                    todo:newTasks
                })
    } catch (e) {
    console.error("CREATE TODO ERROR:", e); // 👈 Add this
    res.status(500).json({
        message: "cant create todo"
    });
}
})

route.get("/",authenticate,async (req,res)=>{
    const userId=(req as any).user.userId;
    try{
        const getAll=await prisma.todo.findMany({
            where:{
                userId
            }
        })
        res.json({
        getAll
    })
    }catch(e){
        res.status(500).json({
            message:"cant fetch todos"
        })
    }
})
route.put("/:id", authenticate, async (req, res) => {
  const todoId = parseInt(req.params.id);
  const userId = (req as any).user.userId;
  const { tasks, done } = req.body;

  try {

    const todo = await prisma.todo.findUnique({
      where: { todoid: todoId },
    });

    if (!todo || todo.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this todo" });
    }

    const updateTodo = await prisma.todo.update({
      where: { todoid: todoId },
      data: { tasks, done },
    });

    res.json({
      message: "Todo updated",
      updateTodo,
    });
  } catch (e) {
    console.error("UPDATE TODO ERROR:", e);
    res.status(400).json({ message: "Can't update todo" });
  }
});

route.delete("/:id",authenticate,async (req,res)=>{
    const todoId = parseInt(req.params.id);
    const userId = (req as any).user.userId;
    try{
        const todo = await prisma.todo.findUnique({
      where: { todoid: todoId },
    });

    if (!todo || todo.userId !== userId) {
      return res.status(403).json({ message: "Not authorized todelete this todo" });
    }
        const deleteTodo=await prisma.todo.delete({
        where:{
            todoid:todoId
        }

    })
    res.json({
        message:"deleted todo "
    })
    }catch(e){
        res.status(400).json({
            message:"cant delete todo"
        })
    }
})
route.patch("/:id/toggle", authenticate, async (req, res) => {
  const todoId = parseInt(req.params.id);
  const userId = (req as any).user.userId;

  try {
    const todo = await prisma.todo.findUnique({
      where: { todoid: todoId },
    });

    if (!todo || todo.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this todo" });
    }

    const updated = await prisma.todo.update({
      where: { todoid: todoId },
      data: { done: !todo.done },
    });

    res.json({
      message: "Todo status toggled",
      todo: updated,
    });
  } catch (e) {
    console.error("TOGGLE TODO ERROR:", e);
    res.status(400).json({ message: "Can't toggle todo status" });
  }
});


export default route;