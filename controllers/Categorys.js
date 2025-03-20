const mongoose=require('mongoose');
const Category=require("../models/Category")


exports.createCategory = async (req, res) => {
    try {
        const { categoryName, price } = req.body;

        // ✅ Validate input
        if (!categoryName || !price) {
            return res.status(400).json({
                success: false,
                message: "All Details Required",
            });
        }

        // ✅ Create new category
        const category = await Category.create({ categoryName, price });

        // ✅ Fixed `status` typo (`staus` → `status`)
        return res.status(200).json({
            success: true,
            message: "Category Created Successfully",
            category,
        });

    } catch (error) {
        console.error("Error: While Creating The Category", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

exports.getAllCategory = async (req, res) => {
    try {
        // ✅ Fetch all categories
        const allCategory = await Category.find({});

        return res.status(200).json({
            success: true,
            message: "Fetched All Categories Successfully",
            allCategory,
        });

    } catch (error) {
        console.error("Error: While Getting All Categories", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


exports.editCategory = async (req, res) => {
    try {
        const { categoryId, categoryName, price } = req.body;

        if (!categoryId || (!categoryName && !price)) {
            return res.status(400).json({
                success: false,
                message: "Category ID and at least one field (name or price) are required."
            });
        }

        // Find and update the category
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { categoryName, price } },
            { new: true, runValidators: true } // Returns updated document
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            updatedCategory
        });

    } catch (error) {
        console.error("Error: While Editing Category", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (error) {
        console.error("Error while deleting category:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
