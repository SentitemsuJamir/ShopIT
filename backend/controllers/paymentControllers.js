import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js"
import Stripe from "stripe";
import bodyParser from "body-parser";
const stripe=Stripe(process.env.STRIPE_SECRET_KEY);





//create stripe checkout session => /api/payment/checkout_session

export const stripeCheckoutSession = catchAsyncErrors(
    async(req, res, next)=>{

        const body= req?.body
        console.log("Request Body:", body);

        const line_items =body?.orderItems?.map((item)=>{
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item?.name,
                        images: [item?.image],
                        metadata: {productId:item?.product},
                    },
                    unit_amount: item?.price * 100
                },
                tax_rates: ["txr_1PmqRRIvVkyxnm26dgmM50l7"],
                quantity: item?.quantity,

            };
        });

        const shippingInfo=body?.shippingInfo

        const shipping_rate= body?.itemsPrice >= 200 ? "shr_1PmqGIIvVkyxnm26wWRhTHxD":"shr_1PmqH7IvVkyxnm26hDOIpGJ5";

        const session= await stripe.checkout.sessions.create({
            payment_method_types : ["card"],
            success_url : `${process.env.FRONTEND_URL}/me/orders`,
            cancel_url : `${process.env.FRONTEND_URL}`,
            customer_email: req?.user?.email,
            client_reference_id: req?.user?._id?.toString(),
            mode: 'payment',
            metadata: {...shippingInfo, itemsPrice: body?.itemsPrice },
            shipping_options: [
                {
                    shipping_rate,

                },
            ],
            line_items,
        });

        res.status(200).json({
            url:session.url,
        });
    }
);

const getOrderItems = async (line_items)=>{
    return new Promise((reslove, reject)=>{
        let cartItems =[];

        line_items?.data?.forEach(async(item)=>{
            const product = await stripe.products.retrieve(item.price.product);
            const productId= product.metadata.productId

            
            cartItems.push({
                product: productId,
                name: product.name,
                price: item.price.unit_amount_decimal /100,
                quantity : item.quantity,
                image: product.images[0],
            })
        });
    });
}

//create new order after payment => /api/payment/webhook

export const stripeWebhook = catchAsyncErrors(
    async(req, res, next)=>{ 
        try {
        
            const signature = req.headers["stripe-signature"];
            const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
            console.log("Body".req.rawBody)
            console.log("Signature :" ,signature)

            console.log(process.env.STRIPE_WEBHOOK_SECRET)

            if (event.type==="checkout.session.completed"){
                const session =event.data.object;

                const line_items = await stripe.checkout.sessions.listLineItems( session.id);

                const orderItems = await getOrderItems(line_items);
                const user = session.client_reference_id;

                const totalAmount= session.amount_total /100;
                const taxAmount= session.total_details.amount_tax/100;
                const shippingAmount= session.total_details.amount_shipping/100;
                const itemsPrice = session.metadata.itemsPrice;

                const shippingInfo= {
                    address: session.metadata.address,
                    city: session.metadata.city,
                    phoneNo: session.metadata.phoneNo,
                    zipCode: session.metadata.zipCode,
                    country: session.metadata.country,
                };

                const paymentInfo = {
                    id : session.payment_intent,
                    status : session.payment_status,
                }

                const orderData= {
                    shippingInfo,
                    orderItems,
                    itemsPrice,
                    taxAmount,
                    shippingAmount,
                    taxAmount,
                    paymentInfo,
                    paymentMethod : "card",
                    user,
                }
               

                console.log(orderData)

                await Order.create(orderData);

                res.status(200).json({sucess : true});
            }

        } catch (error){
            console.log(error);
        }
    });