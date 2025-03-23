const axios = require('axios'); // For CommonJS modules
const ActiveTask = require('../models/ActiveTask');

// Fetch real-time route between delivery partner and client using OpenStreetMap (OSRM)
exports.getRouteActive = async (req, res) => {
    try {
        

        const { taskId } = req.body; // Get task ID from request
        if (!taskId) {
            return res.status(400).json({ error: "Task ID is required" });
        }

        // Find the active task and populate client & worker details
        const task = await ActiveTask.findById(taskId).populate("client worker category");
       
        if (!task) {
            return res.status(404).json({ error: "Active task not found" });
        }

        const { clientLocation, workerLocation } = task;
        console.log("Client Location:", clientLocation);
        console.log("Worker Location:", workerLocation);

        if (!clientLocation || !workerLocation || !workerLocation.latitude || !workerLocation.longitude) {
            return res.status(400).json({ error: "Client or Worker location data is missing or incomplete" });
        }

        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${workerLocation.longitude},${workerLocation.latitude};${clientLocation.longitude},${clientLocation.latitude}?overview=full&geometries=geojson`;
       

        const response = await axios.get(osrmUrl);
       

        if (response.data.routes.length === 0) {
            return res.status(404).json({ error: "No route found" });
        }

        // Convert distance to kilometers
        const distanceKm = response.data.routes[0].distance / 1000;

        res.json({
            success: true,
            message: "Fetched route successfully.",
            task: task,
            distance: `${distanceKm.toFixed(2)} km`,
            duration: response.data.routes[0].duration, // Duration in seconds
            geometry: response.data.routes[0].geometry, // Route geometry (GeoJSON)
        });
    } catch (error) {
        console.error("OSRM Error:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

exports.getRouteRequested = async (req, res) => {
    try {
        const { taskId, workerLatitude, workerLongitude } = req.body;
    
        if (!workerLatitude || !workerLongitude) {
          return res.status(400).json({ success: false, message: "Worker location is required." });
        }
    
        const task = await ActiveTask.findById(taskId);
        if (!task || !task.clientLocation) {
          return res.status(404).json({ success: false, message: "Task not found or client location missing." });
        }
    
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${workerLongitude},${workerLatitude};${task.clientLocation.longitude},${task.clientLocation.latitude}?overview=full&geometries=geojson`;
    
        const response = await axios.get(osrmUrl);
    
        if (!response.data.routes?.length) {
          return res.status(404).json({ success: false, message: "No route found." });
        }
    
        return res.status(200).json({
          success: true,
          route: {
            distance: `${(response.data.routes[0].distance / 1000).toFixed(2)} km`,
            duration: `${(response.data.routes[0].duration / 60).toFixed(2)} min`,
            geometry: response.data.routes[0].geometry,
          },
        });
      } catch (error) {
        console.error("Error fetching route:", error);
        return res.status(500).json({ success: false, message: "Server error." });
      }
};
