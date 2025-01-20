import mongoose from "mongoose";
import { courseModel } from "../models/course.js";
import { userModel } from "../models/user.js";
import { orderModel } from "../models/order.js";

export const getAllOrders = async (req, res) => {
    try {
        let data = await orderModel.find();
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, it is not possible to get the list of all orders", message: err.message });
    }
}

export const getOrdersByUserId = async (req, res) => {
    let { userId } = req.params;
    try {
        let data = await orderModel.find({ userId: userId });
        if (!data)
            return res.status(404).json({ title: "Error", message: "The userId does not exist" });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the orders cannot be displayed by userId", message: err.message });
    }
}

export const addOrder = async (req, res) => {
    let { body } = req;
    if (!body.userId || !body.courses || !body.courses.length)
        return res.status(400).json({ title: "Error, the order cannot be completed", message: "details are missing" });
    try {
        let newOrder = new orderModel(body);
        let data = await newOrder.save();
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the order cannot be completed", message: err.message });
    }
}

export const deleteOrderById = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return res.status(400).json({ title: "Error", message: "The id is not valid" });
    try {
        let data = await orderModel.findById(id);
        if (!data)
            return res.status(404).json({ title: "Error", message: "The ID does not exist" });
        if (data.isPaid)
            return res.status(400).json({ title: "Error", message: "It is not possible to cancel an order that has already been paid" });
            data=await orderModel.findByIdAndDelete(id);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the order cannot be canceled", message: err.message });
    }
}

export const updateOrderPayment= async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return res.status(400).json({ title: "Error", message: "The id is not valid" });
    try {
        let data = await orderModel.findByIdAndUpdate(id, {isPaid:true}, { new: true });
        if (!data)
            return res.status(404).json({ title: "Error", message: "The ID does not exist" });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the payment of order cannot be updated", message: err.message });
    }
}
