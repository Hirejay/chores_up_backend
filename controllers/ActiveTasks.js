const mongoose=require('mongoose');
const ActiveTask=require("../models/ActiveTask");
const Task=require('../models/Task')
const User = require('../models/User');
const Profile=require("../models/Profile")
const EPFO=require('../models/EPFO')
require('dotenv').config();
exports.createRequestedTask = async (req, res) => {
    try {
        const { category, instruction, clientLocation } = req.body;
        const client = req.user.id;

        if (!category || !client || !clientLocation) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const task = await ActiveTask.create({ category, instruction, client, clientLocation });

        res.status(200).json({
            success: true,
            message: "New requested task has been created successfully.",
            task
        });

    } catch (error) {
        console.error("Error while creating task:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the task. Please try again later."
        });
    }
};



exports.acceptRequestedTask = async (req, res) => {
    try {
        const workerId = req.user.id; // Get worker ID from authenticated user
        const { requestedTaskId, workerLocation } = req.body;

        // Validate input fields
        if (!requestedTaskId || !workerLocation || !workerLocation.latitude || !workerLocation.longitude) {
            return res.status(400).json({
                success: false,
                message: "Task ID and valid worker location (latitude, longitude) are required."
            });
        }

        // Find the requested task
        const task = await ActiveTask.findById(requestedTaskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Requested task not found."
            });
        }

        // Check if the task is still available
        if (task.status !== "Requested") {
            return res.status(400).json({
                success: false,
                message: "This task has already been accepted or is no longer available."
            });
        }

        // Assign worker and update status
        task.worker = workerId;
        task.workerLocation = workerLocation;
        task.status = "Active"; // Corrected status to "Active"
        
        // Save the updated task
        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task successfully accepted.",
            task
        });

    } catch (error) {
        console.error("Error while accepting the requested task:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while accepting the task. Please try again later.",
            error: error.message
        });
    }
};


exports.updateWorkerLocation = async (req, res) => {
    try {
        const { taskId } = req.body; // Extract task ID from request 
        const { latitude, longitude } = req.body; // Extract new worker location details

        if (!latitude || !longitude ) {
            return res.status(400).json({
                success: false,
                message: "Latitude and  longitude are required."
            });
        }

        // Find and update the worker's location in ActiveTask
        const updatedTask = await ActiveTask.findByIdAndUpdate(
            taskId,
            {
                $set: {
                    "workerLocation.latitude": latitude,
                    "workerLocation.longitude": longitude,
                    
                }
            },
            { new: true } // Return updated document
        );

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Active task not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Worker location updated successfully.",
            updatedTask
        });

    } catch (error) {
        console.error("Error updating worker location:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating worker location.",
            details: error.message
        });
    }
};


exports.getRequestedTask = async (req, res) => {
    try {
        const workerId = req.user.id;

        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found."
            });
        }

        const profile = await Profile.findById(worker.additionalDetails);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Worker profile not found."
            });
        }

        const allRequestedTasks = await ActiveTask.find({
            status: "Requested",
            category: { $in: profile.categorys }
        });

        return res.status(200).json({
            success: true,
            message: "Fetched all requested tasks successfully.",
            allRequestedTasks
        });

    } catch (error) {
        console.error("Error while fetching requested tasks:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching requested tasks. Please try again later."
        });
    }
};


exports.getRequestedTaskForClient = async (req, res) => {
    try {
        const clientId = req.user.id;

        const client = await User.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found."
            });
        }

        const requestedTasks = await ActiveTask.find({
            status: "Requested",
            client: clientId
        });

        return res.status(200).json({
            success: true,
            message: "Fetched all requested tasks for the client successfully.",
            requestedTasks
        });

    } catch (error) {
        console.error("Error while fetching requested tasks for client:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching requested tasks. Please try again later."
        });
    }
};



//delete is pending
exports.cancelRequestedTask = async (req, res) => {
    try {
        const { activeTaskId } = req.body;
        const userId = req.user.id;

        // Attempt to delete the requested task if it belongs to the client and is still in "Requested" status
        const deletedActiveTaskDetail = await ActiveTask.findOneAndDelete({
            _id: activeTaskId,
            client: userId,
            status: "Requested"
        });

        if (deletedActiveTaskDetail) {
            // Create a record in Task collection with "Canceled" status
            const addTask = await Task.create({
                category: deletedActiveTaskDetail.category,
                instruction: deletedActiveTaskDetail.instruction,
                client: deletedActiveTaskDetail.client,
                clientLocation: deletedActiveTaskDetail.clientLocation,
                status: "Canceled", // Fixed spelling from "Chancel" to "Canceled"
                requestedAt: deletedActiveTaskDetail.createdAt,
            });

            return res.status(200).json({
                success: true,
                message: "Requested task canceled successfully",
                deletedActiveTaskDetail,
                addTask
            });
        }

        return res.status(400).json({
            success: false,
            message: "Worker is already allocated, can't cancel the request"
        });

    } catch (error) {
        console.error("Error: While canceling the requested task", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.completeActiveTask = async (req, res) => {
    try {
        const workerId = req.user.id;
        const { activeTaskId } = req.body;

        if (!activeTaskId) {
            return res.status(400).json({
                success: false,
                message: "Active Task ID is required",
            });
        }

        // Find and delete the active task while populating the category field
        const completedTask = await ActiveTask.findByIdAndDelete(activeTaskId).populate("category");

        if (!completedTask) {
            return res.status(404).json({
                success: false,
                message: "Active Task not found",
            });
        }

        // Create a new task entry with "Completed" status
        const addTask = await Task.create({
            category: completedTask.category,
            instruction: completedTask.instruction,
            client: completedTask.client,
            clientLocation: completedTask.clientLocation,
            worker: completedTask.worker,
            workerLocation: completedTask.workerLocation,
            status: "Completed",
            requestedAt: completedTask.createdAt,
        });

        // Update EPFO fees (increment by 10% of category price)
        const updatedEPFO = await EPFO.findOneAndUpdate(
            { worker: completedTask.worker },
            { $inc: { fees: completedTask.category.price *( parseFloat(process.env.EPFO_CHARGE)/100) } }, // 10% increment
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Task marked as completed successfully",
            completedTask: addTask,
            updatedEPFO,
        });

    } catch (error) {
        console.error("Error while completing task:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getAllActiveTask = async (req, res) => {
    try {
        const userId = req.user.id;

        // 🔹 Use $or to check both worker & client fields
        const activeTasks = await Task.find({
            $or: [{ worker: userId }, { client: userId }]
        });

        return res.status(200).json({
            success: true,
            tasks: activeTasks,
        });

    } catch (error) {
        console.error("Error: While getting all active tasks", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
    
};
