/*
const axios = require('axios'); // For CommonJS modules
const ActiveTask = require('../models/ActiveTask');

// Fetch real-time route between delivery partner and client using OpenStreetMap (OSRM)
exports.getRouteActive = async (req, res) => {
  try {
      console.log("Received request for getRouteActive");

      const { taskId } = req.body; // Get task ID from request
      console.log("Task ID:", taskId);

      if (!taskId) {
          console.log("Error: Task ID is missing");
          return res.status(400).json({ error: "Task ID is required" });
      }

      // Find the active task and populate client & worker details
      const task = await ActiveTask.findById(taskId).populate("client worker category");
      console.log("Fetched task from DB:", task);

      if (!task) {
          console.log("Error: Task not found");
          return res.status(404).json({ error: "Active task not found" });
      }

      const { clientLocation, workerLocation } = task;
      console.log("Client Location:", clientLocation);
      console.log("Worker Location:", workerLocation);

      if (!clientLocation || !workerLocation || !workerLocation.latitude || !workerLocation.longitude) {
          console.log("Error: Incomplete location data");
          return res.status(400).json({ error: "Client or Worker location data is missing or incomplete" });
      }

      // Construct the OSRM API URL
      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${workerLocation.longitude},${workerLocation.latitude};${clientLocation.longitude},${clientLocation.latitude}?overview=full&geometries=geojson`;
      console.log("OSRM URL:", osrmUrl);

      // Make the request to OSRM
      const response = await axios.get(osrmUrl);
      console.log("OSRM Response:", response.data);

      if (response.data.routes.length === 0) {
          console.log("Error: No route found");
          return res.status(404).json({ error: "No route found" });
      }

      // Convert distance to kilometers
      const distanceKm = response.data.routes[0].distance / 1000;
      console.log("Calculated Distance:", distanceKm.toFixed(2), "km");

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
*/



/*

const axios = require("axios");
const ActiveTask = require("../models/ActiveTask");

// Define your deployed proxy server URL
const PROXY_SERVER_URL = "https://proxy-route-jze075eol-chores-ups-projects.vercel.app"; // Replace with actual proxy URL
// const PROXY_SERVER_URL = "http://localhost:5000"; 
// Fetch real-time route between delivery partner and client using Proxy Server
exports.getRouteActive = async (req, res) => {
  try {
    console.log("Received request for getRouteActive");

    const { taskId } = req.body;
    console.log("Task ID:", taskId);

    if (!taskId) {
      console.log("Error: Task ID is missing");
      return res.status(400).json({ error: "Task ID is required" });
    }

    const task = await ActiveTask.findById(taskId).populate("client worker category");
    console.log("Fetched task from DB:", task);

    if (!task) {
      console.log("Error: Task not found");
      return res.status(404).json({ error: "Active task not found" });
    }

    const { clientLocation, workerLocation } = task;
    console.log("Client Location:", clientLocation);
    console.log("Worker Location:", workerLocation);

    if (!clientLocation || !workerLocation || !workerLocation.latitude || !workerLocation.longitude) {
      console.log("Error: Incomplete location data");
      return res.status(400).json({ error: "Client or Worker location data is missing or incomplete" });
    }

    // Call the Proxy API
    const response = await axios.post(`${PROXY_SERVER_URL}/get-route`, {
      workerLatitude: workerLocation.latitude,
      workerLongitude: workerLocation.longitude,
      clientLatitude: clientLocation.latitude,
      clientLongitude: clientLocation.longitude,
    });

    if(!response.data.success){
      return res.json(response.data);
    }
    

    console.log("Proxy Server Response:", response.data);

    
    return res.status(200).json(
      {
        success:true,
        geometry:response.data.route.geometry,
        distance:response.data.route.distance,
        duration:response.data.route.duration,
        task:task

      });
  } catch (error) {
    console.error("Proxy Error:", error.message);
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

    // Call the Proxy API
    const response = await axios.post(`${PROXY_SERVER_URL}/get-route`, {
      workerLatitude,
      workerLongitude,
      clientLatitude: task.clientLocation.latitude,
      clientLongitude: task.clientLocation.longitude,
    });

    if(!response.data.success){
      return res.json(response.data);
    }
    
    return res.status(200).json(
      {
        success:true,
        geometry:response.data.route.geometry,
        distance:response.data.route.distance,
        duration:response.data.route.duration,
        task:task

      });
  } catch (error) {
    console.error("Error fetching route:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
*/


/*
const axios = require("axios");
const ActiveTask = require("../models/ActiveTask");

// Your OpenRouteService API key (replace with your own)
const ORS_API_KEY = "5b3ce3597851110001cf62481ad39674ab4346cd826fcf11dfc9c1ed";

async function getRouteFromORS(startLng, startLat, endLng, endLat) {
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const body = {
    coordinates: [
      [startLng, startLat],
      [endLng, endLat],
    ],
  };

  const headers = {
    Accept: "application/json, application/geo+json",
    Authorization: ORS_API_KEY,
    "Content-Type": "application/json",
  };

  const response = await axios.post(url, body, { headers });

  return response.data;
}

exports.getRouteActive = async (req, res) => {
  try {
    console.log("Received request for getRouteActive");

    const { taskId } = req.body;
    console.log("Task ID:", taskId);

    if (!taskId) {
      console.log("Error: Task ID is missing");
      return res.status(400).json({ error: "Task ID is required" });
    }

    const task = await ActiveTask.findById(taskId).populate("client worker category");
    console.log("Fetched task from DB:", task);

    if (!task) {
      console.log("Error: Task not found");
      return res.status(404).json({ error: "Active task not found" });
    }

    const { clientLocation, workerLocation } = task;
    console.log("Client Location:", clientLocation);
    console.log("Worker Location:", workerLocation);

    if (!clientLocation || !workerLocation || !workerLocation.latitude || !workerLocation.longitude) {
      console.log("Error: Incomplete location data");
      return res.status(400).json({ error: "Client or Worker location data is missing or incomplete" });
    }

    // Call OpenRouteService directly
    const orsData = await getRouteFromORS(
      workerLocation.longitude,
      workerLocation.latitude,
      clientLocation.longitude,
      clientLocation.latitude
    );

    if (!orsData.features || !orsData.features.length) {
      return res.status(404).json({ error: "No route found" });
    }

    const route = orsData.features[0];
    const summary = route.properties.summary;

    return res.status(200).json({
      success: true,
      geometry: route.geometry,
      distance: `${(summary.distance / 1000).toFixed(2)} km`,
      duration: summary.duration, // in seconds
      task: task,
    });
  } catch (error) {
    console.error("OpenRouteService Error:", error.message);
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

    // Call OpenRouteService directly
    const orsData = await getRouteFromORS(
      workerLongitude,
      workerLatitude,
      task.clientLocation.longitude,
      task.clientLocation.latitude
    );

    if (!orsData.features || !orsData.features.length) {
      return res.status(404).json({ success: false, message: "No route found." });
    }

    const route = orsData.features[0];
    const summary = route.properties.summary;

    return res.status(200).json({
      success: true,
      geometry: route.geometry,
      distance: `${(summary.distance / 1000).toFixed(2)} km`,
      duration: summary.duration, // in seconds
      task: task,
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
*/


const axios = require("axios");
const ActiveTask = require("../models/ActiveTask");

// Your OpenRouteService API key (replace with your own)
const ORS_API_KEY = "5b3ce3597851110001cf62481ad39674ab4346cd826fcf11dfc9c1ed";

async function getRouteFromORS(startLng, startLat, endLng, endLat) {
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const body = {
    coordinates: [
      [startLng, startLat],
      [endLng, endLat],
    ],
    instructions: true,
  };

  const headers = {
    Accept: "application/json, application/geo+json",
    Authorization: ORS_API_KEY,
    "Content-Type": "application/json",
  };

  const response = await axios.post(url, body, { headers });

  return response.data;
}

exports.getRouteActive = async (req, res) => {
  try {
    console.log("Received request for getRouteActive");

    const { taskId } = req.body;
    console.log("Task ID:", taskId);

    if (!taskId) {
      console.log("Error: Task ID is missing");
      return res.status(400).json({ error: "Task ID is required" });
    }

    const task = await ActiveTask.findById(taskId).populate("client worker category");
    console.log("Fetched task from DB:", task);

    if (!task) {
      console.log("Error: Task not found");
      return res.status(404).json({ error: "Active task not found" });
    }

    const { clientLocation, workerLocation } = task;
    console.log("Client Location:", clientLocation);
    console.log("Worker Location:", workerLocation);

    if (!clientLocation || !workerLocation || !workerLocation.latitude || !workerLocation.longitude) {
      console.log("Error: Incomplete location data");
      return res.status(400).json({ error: "Client or Worker location data is missing or incomplete" });
    }

    const orsData = await getRouteFromORS(
      workerLocation.longitude,
      workerLocation.latitude,
      clientLocation.longitude,
      clientLocation.latitude
    );

    if (!orsData.features || !orsData.features.length) {
      return res.status(404).json({ error: "No route found" });
    }

    const route = orsData.features[0];
    const summary = route.properties.summary;
    const steps = route.properties.segments[0].steps.map((step) => ({
      instruction: step.instruction,
      distance: `${step.distance.toFixed(1)} m`,
      duration: `${step.duration.toFixed(1)} sec`,
      name: step.name,
      type: step.type,
    }));

    return res.status(200).json({
      success: true,
      geometry: route.geometry,
      distance: `${(summary.distance / 1000).toFixed(2)} km`,
      duration: `${(summary.duration / 60).toFixed(2)} min`,
      task: task,
      steps: steps,
    });
  } catch (error) {
    console.error("OpenRouteService Error:", error.message);
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

    const orsData = await getRouteFromORS(
      workerLongitude,
      workerLatitude,
      task.clientLocation.longitude,
      task.clientLocation.latitude
    );

    if (!orsData.features || !orsData.features.length) {
      return res.status(404).json({ success: false, message: "No route found." });
    }

    const route = orsData.features[0];
    const summary = route.properties.summary;
    const steps = route.properties.segments[0].steps.map((step) => ({
      instruction: step.instruction,
      distance: `${step.distance.toFixed(1)} m`,
      duration: `${step.duration.toFixed(1)} sec`,
      name: step.name,
      type: step.type,
    }));

    return res.status(200).json({
      success: true,
      geometry: route.geometry,
      distance: `${(summary.distance / 1000).toFixed(2)} km`,
      duration: `${(summary.duration / 60).toFixed(2)} min`,
      task: task,
      steps: steps,
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
