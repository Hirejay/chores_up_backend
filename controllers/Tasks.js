const ActiveTask = require("../models/ActiveTask");
const Task=require("../models/Task")


exports.getAllTask = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all tasks where the user is either the client or the worker
        const allTasks = await Task.find({ $or: [{ client: userId }, { worker: userId }] })
            .populate('client worker category');

        // Categorize tasks into 'completed' and 'canceled'
        const completedTasks = allTasks.filter(task => task.status === 'completed');
        const canceledTasks = allTasks.filter(task => task.status === 'canceled');

        res.status(200).json({
            success: true,
            message: "Fetched tasks successfully",
            completedTasks,
            canceledTasks
        });

    } catch (error) {
        console.error("Error: While Getting All Tasks", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



