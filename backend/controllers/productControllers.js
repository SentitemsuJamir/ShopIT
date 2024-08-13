import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js"
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";


//create new product => /api/products
export const getProducts= catchAsyncErrors (async (req, res)=>{
    const resPerPage=4;
    const apiFilters= new APIFilters(Product, req.query).search().filters();

    let products= await apiFilters.query;
    let filteredProductsCount=products.length;

    

    apiFilters.pagination(resPerPage);
    products= await apiFilters.query.clone();
    res.status(200).json({
        resPerPage,
        filteredProductsCount,
       products,
    });
});


//create new product => /api/admin/products

export const newProducts=catchAsyncErrors ( async (req, res)=>{
    req.body.user=req.user._id

    const product=await Product.create(req.body);

    res.status(200).json({
        product,
    });
    
});

//get single product detail => /api/products/:id

export const getProducDetails= catchAsyncErrors (async (req, res,next)=>{
    const product=await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        product,
    });
    
});

//update product detail => /api/products/:id

export const updateProduct= catchAsyncErrors (async (req, res)=>{
    let product=await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
        new:true,
    });

    res.status(200).json({
        product,
    });
    
});


//Delete product detail => /api/products/:id

export const deleteProduct= catchAsyncErrors (async (req, res)=>{
    const product=await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    await Product.deleteOne();

    res.status(200).json({
        message: "Product Deleted",
    });
    
});


//Create/Update product review => /api/reviews

export const createProductReview= catchAsyncErrors (async (req, res,next)=>{
    
    const {rating, comment, productId}=req.body;

    const review = {
        user: req?.user?._id,
        rating: Number(rating),
        comment,
    };
    const product=await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    const isReviwed = product?.reviews?.find(
        (r)=> r.user.toString()==req?.user?._id.toString()
    );

    if (isReviwed){
        product.reviews.forEach((review)=>{
            if (review?.user?.toString()===req?.user?._id.toString()){
                review.comment=comment;
                review.rating;
            }
        });
    }else {
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length;
    }

    product.ratings=product.reviews.reduce((acc,item)=> item.rating+acc,0)/product.reviews.length;

    await product.save({validateBeforeSave: false});


    res.status(200).json({
        success: true,
    });
    
});

// get product review => /api/reviews

export const getProductReview= catchAsyncErrors (async (req, res, next)=>{
    const product = await Product.findById(req.query.id)

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews || [], // Ensure reviews is always an array
    });
})


//Delete product review => /api/admin/reviews

export const deleteReview= catchAsyncErrors (async (req, res,next)=>{
    
    let product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviewId = req?.query?._id;
    product.reviews = product?.reviews?.filter(
        (review)=> review._id.toString()!==reviewId.toString()
    );

    const numOfReviews= product.reviews.length;

    const ratings= numOfReviews==0?0
    : product.reviews.reduce((acc,item)=> item.rating+acc,0)/numOfReviews;

     // Update product with filtered reviews, numOfReviews, and ratings
  product = await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews: product.reviews, numOfReviews, ratings },
    { new: true } // Ensure to get the updated document back
  );

    await product.save({validateBeforeSave: false});


    res.status(200).json({
        success: true,
        product,
    });
    
});