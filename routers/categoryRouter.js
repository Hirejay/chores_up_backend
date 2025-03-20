const express = require('express');
const router = express.Router();

// Middleware
const { isAuth, isAccepted, isAdmin, isClient, isWorker } = require('../middlewares/auth');

const { 
    createCategory, 
    getAllCategory, 
    editCategory, 
    deleteCategory 
} = require('../controllers/Categorys');

// Category Routes
router.post('/category/create', isAuth, isAdmin, createCategory); // Create a new category
router.get('/category/all', isAuth, isAdmin, getAllCategory);  // Get all categories
router.put('/category/edit', isAuth, isAdmin, editCategory); // Edit a category
router.delete('/category/delete', isAuth, isAdmin, deleteCategory); // Delete a category

module.exports = router;
