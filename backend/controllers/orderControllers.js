import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import  Order from "../models/order.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/product.js"


//create new order => /api/orders/new

export const newOrder = catchAsyncErrors(async (req,res,next)=>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        paymentInfo,
    } = req.body;

    // Check if all necessary fields are provided
    if (!orderItems || !shippingInfo || !itemsPrice || !taxAmount || !totalAmount || !paymentMethod) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        paymentInfo,
        user: req.user._id
    });
    res.status(200).json({
        order,
    })
})

//Get current order details => /api/me/orders/:id

export const myOrders = catchAsyncErrors(async (req,res,next)=>{
    const order= await Order.find({user: req.user._id});
    if(!order){
        return next(new ErrorHandler("No order with this ID",400));
    }

    res.status(200).json({
        order,
    });
});


//Get order details => /api/orders/:id

export const getOrderDetails = catchAsyncErrors(async (req,res,next)=>{
    const order= await Order.findById(req.params.id).populate('user', 'name email');

    if(!order){
        return next(new ErrorHandler("No order with this ID",400));
    }

    res.status(200).json({
        order,
    });
});

//Get all orders-ADMIN => /api/admin/orders
export const allOrders = catchAsyncErrors(async (req,res,next)=>{
    const orders= await Order.find();
    if(!orders){
        return next(new ErrorHandler("No order with this ID",400));
    }

    res.status(200).json({
        orders,
    });
});


//Update Order -ADMIN => /api/admin/orders/:id

export const updateOrder = catchAsyncErrors( async (req, res, next)=>{


    const order= await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("No Order found with this ID", 404));
    }
    if(order?.orderStatus ==="Delivered"){
        return next(new ErrorHandler("Order already delivered", 400));
    }
    //update product stock
    order?.orderItems?.forEach( async (item)=> {
        const product = await Product.findById(item?.product?.toString());
        if(!product){
            return next(new ErrorHandler("No Product found with this ID", 400));
        }
        product.stock = product.stock - item.quantity;
        await product.save();
    });
    
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now()

    await order.save();


    res.status(200).json({
        success: true,
    })
})


//Delete Order=> /api/admin/orders/:id

export const deleteOrder = catchAsyncErrors(async (req,res,next)=>{
    const order= await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("No order with this ID",400));
    }

    await order.deleteOne()
    res.status(200).json({
        success: true,
    });
});