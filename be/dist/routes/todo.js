"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const middleware_1 = require("../middleware");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const route = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
route.post("/", middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = req.body.tasks;
    const done = req.body.done;
    const userId = req.user.userId;
    try {
        const newTasks = yield prisma.todo.create({
            data: {
                tasks,
                done,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
        res.json({
            message: "Todo create",
            todo: newTasks
        });
    }
    catch (e) {
        console.error("CREATE TODO ERROR:", e); // 👈 Add this
        res.status(500).json({
            message: "cant create todo"
        });
    }
}));
route.get("/", middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const getAll = yield prisma.todo.findMany({
            where: {
                userId
            }
        });
        res.json({
            getAll
        });
    }
    catch (e) {
        res.status(500).json({
            message: "cant fetch todos"
        });
    }
}));
route.put("/:id", middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todoId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { tasks, done } = req.body;
    try {
        const todo = yield prisma.todo.findUnique({
            where: { todoid: todoId },
        });
        if (!todo || todo.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to update this todo" });
        }
        const updateTodo = yield prisma.todo.update({
            where: { todoid: todoId },
            data: { tasks, done },
        });
        res.json({
            message: "Todo updated",
            updateTodo,
        });
    }
    catch (e) {
        console.error("UPDATE TODO ERROR:", e);
        res.status(400).json({ message: "Can't update todo" });
    }
}));
route.delete("/:id", middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todoId = parseInt(req.params.id);
    const userId = req.user.userId;
    try {
        const todo = yield prisma.todo.findUnique({
            where: { todoid: todoId },
        });
        if (!todo || todo.userId !== userId) {
            return res.status(403).json({ message: "Not authorized todelete this todo" });
        }
        const deleteTodo = yield prisma.todo.delete({
            where: {
                todoid: todoId
            }
        });
        res.json({
            message: "deleted todo "
        });
    }
    catch (e) {
        res.status(400).json({
            message: "cant delete todo"
        });
    }
}));
route.patch("/:id/toggle", middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todoId = parseInt(req.params.id);
    const userId = req.user.userId;
    try {
        const todo = yield prisma.todo.findUnique({
            where: { todoid: todoId },
        });
        if (!todo || todo.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to update this todo" });
        }
        const updated = yield prisma.todo.update({
            where: { todoid: todoId },
            data: { done: !todo.done },
        });
        res.json({
            message: "Todo status toggled",
            todo: updated,
        });
    }
    catch (e) {
        console.error("TOGGLE TODO ERROR:", e);
        res.status(400).json({ message: "Can't toggle todo status" });
    }
}));
exports.default = route;
