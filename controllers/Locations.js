const axios = require('axios'); // For CommonJS modules
const ActiveTask =require('../models/ActiveTask')

// Fetch real-time route between delivery partner and client using OpenStreetMap (OSRM)
exports.getRouteActive = async (req, res) => {
  try {
      const { taskId } = req.body; // Get task ID from request 

      if (!taskId) {
          return res.status(400).json({ error: "Task ID is required" });
      }

      // Find the active task and populate client & worker details
      const task = await ActiveTask.findById(taskId).populate("client worker");
      if (!task) {
          return res.status(404).json({ error: "Active task not found" });
      }

      const { clientLocation, workerLocation } = task;

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
          distance: `${distanceKm.toFixed(2)} km`, // Distance in km (formatted to 2 decimal places)
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
      const { taskId } = req.body; // Extract task ID from request parameters
      const { workerLatitude, workerLongitude } = req.body; // Extract worker's live location from request body

      // Validate worker location
      if (!workerLatitude || !workerLongitude) {
          return res.status(400).json({
              success: false,
              message: "Worker location is required."
          });
      }

      // Find the active task by ID
      const task = await ActiveTask.findById(taskId);
      if (!task) {
          return res.status(404).json({
              success: false,
              message: "Active task not found."
          });
      }

      // Extract client location
      const { clientLocation } = task;

      // Validate client location
      if (!clientLocation || !clientLocation.latitude || !clientLocation.longitude) {
          return res.status(400).json({
              success: false,
              message: "Client location is missing or incomplete."
          });
      }

      // Construct the OSRM API request URL
      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${workerLongitude},${workerLatitude};${clientLocation.longitude},${clientLocation.latitude}?overview=full&geometries=geojson`;

      // Call OSRM API to fetch the route
      const response = await axios.get(osrmUrl);

      // Handle case where no route is found
      if (!response.data.routes || response.data.routes.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No route found between worker and client."
          });
      }

      // Extract distance (in meters) and convert to km
      const distanceInKm = response.data.routes[0].distance / 1000;

      // Extract duration (in seconds)
      const durationInMinutes = response.data.routes[0].duration / 60;

      return res.status(200).json({
          success: true,
          message: "Route fetched successfully.",
          route: {
              distance: `${distanceInKm.toFixed(2)} km`,
              duration: `${durationInMinutes.toFixed(2)} min`,
              geometry: response.data.routes[0].geometry // GeoJSON route data
          }
      });

  } catch (error) {
      console.error("Error fetching route:", error);
      return res.status(500).json({
          success: false,
          message: "An error occurred while fetching the route.",
          details: error.message
      });
  }
};