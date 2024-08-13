import mongoose from "mongoose";
import {products} from "./data.js";
import Product from "../models/product.js"

const seedProducts = async ()=> {
    try{
        await mongoose.connect("mongodb://localhost:27017/ecommerce");

        await Product.deleteMany();
        console.log('Products are deleted')

        await Product.insertMany(products)
        console.log('Products are inserted')
        
        process.exit();
    } catch (err){
        console.log(err.message);
        process.exit();
    }
}

seedProducts();