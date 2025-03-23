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

        // Validate required fields
        if (!category || !client || !clientLocation || !clientLocation.latitude || !clientLocation.longitude || !clientLocation.address) {
            return res.status(400).json({
                success: false,
                message: "All fields including client location (latitude, longitude) are required."
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
        if (task.status !== "requested") {
            return res.status(400).json({
                success: false,
                message: "This task has already been accepted or is no longer available."
            });
        }

        // Assign worker and update status
        task.worker = workerId;
        task.workerLocation = workerLocation;
        task.status = "active"; // Corrected status to "Active"
        
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
        const workerId=req.user.id;
        const {  latitude, longitude } = req.body; // Extract workerId and location details

        // Validate required fields
        if (!workerId || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Worker ID, latitude, and longitude are required."
            });
        }

        // Update worker location in all ActiveTask documents where worker matches workerId
        const updatedTasks = await ActiveTask.updateMany(
            { worker: workerId }, // Filter: Find all tasks where worker matches workerId
            {
                $set: {
                    "workerLocation.latitude": latitude,
                    "workerLocation.longitude": longitude,
                }
            },
            { new: true } // Return updated documents
        );

        

        return res.status(200).json({
            success: true,
            message: "Worker location updated successfully ",
            updatedTasks
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
            status: "requested",
            category: { $in: profile.categorys }
        })
        .populate("category")  // Populates category details
        .populate("client", "firstName lastName email"); // Populates specific fields of client
        
        return res.status(200).json({
            success: true,
            message: "Fetched all requested tasks successfully.",
            tasks:allRequestedTasks
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
            status: "requested",
            client: clientId
        })
        .populate("category") // Populates category details
        .populate("client", "firstName lastName email"); // Populates specific client fields
        

        return res.status(200).json({
            success: true,
            message: "Fetched all requested tasks for the client successfully.",
            tasks:requestedTasks
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
            status: "requested"
        });

        if (deletedActiveTaskDetail) {
            // Create a record in Task collection with "Canceled" status
            const addTask = await Task.create({
                category: deletedActiveTaskDetail.category,
                instruction: deletedActiveTaskDetail.instruction,
                client: deletedActiveTaskDetail.client,
                clientLocation: deletedActiveTaskDetail.clientLocation,
                status: "canceled", // Fixed spelling from "Chancel" to "Canceled"
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
            status: "completed",
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
        const activeTasks = await ActiveTask.find({
            $or: [{ worker: userId }, { client: userId }],
            status: "active",
          })
            .populate('category', 'categoryName price') // Populate category fields
            .populate('client', 'firstName lastName email phoneNo') // Populate client fields
            .populate('worker', 'firstName lastName email phoneNo'); // Populate worker fields

       

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
