const Product = require('../models/Product');

// Add or Update Product
exports.addProduct = async (req, res) => {
    try {
        const { metal_type, price_per_gram, stock } = req.body;

        let product = await Product.findOne({ dealer_id: req.user.id, metal_type });

        if (product) {
            // Update existing
            product.price_per_gram = price_per_gram;
            product.stock = stock; // Set absolute stock, or add? User likely wants to set current state.
            // Let's assume setting current state as per dashboard usually works "manage inventory" style
            product.updatedAt = Date.now();
            await product.save();
            return res.json({ message: 'Product Updated Successfully', product });
        }

        // Create new
        const newProduct = new Product({
            dealer_id: req.user.id,
            metal_type,
            price_per_gram,
            stock
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product Added Successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Product (price/stock)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { price_per_gram, stock } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check ownership
        if (product.dealer_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this product' });
        }

        if (price_per_gram) product.price_per_gram = price_per_gram;
        if (stock) product.stock = stock;
        product.updatedAt = Date.now();

        await product.save();
        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Products (For Customers - Live Prices)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('dealer_id', 'name company_name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get My Products (Dealer Inventory)
exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ dealer_id: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
