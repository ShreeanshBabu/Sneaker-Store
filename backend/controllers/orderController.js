const { CANCELLED } = require('node:dns');
const prisma = require('../lib/prisma');

const validTransitions = {
    PENDING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: ['RETURN_REQUESTED'],
    CANCELLED: [],
    RETURN_REQUESTED: [],
};

const userAllowedStatuses = ['CANCELLED', 'RETURN_REQUESTED'];

async function checkout(req, res) {
    try {
        const cart = await prisma.cart.findUnique({
            where: {userId: req.user.userId},
            include: {
                cartItems: {
                    include: {variant: true},
                },
            },
        });

        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).json({error: 'Your cart is empty'});
        }

        const order = await prisma.$transaction(async(tx) => {
            for (const item of cart.cartItems) {
                if (item.quantity > item.variant.stock) {
                    throw new Error(`Insufficient stock for variant ${item.variantId}`);
                }
            }

            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.userId,
                    status: 'PENDING',
                    orderItems: {
                        create: cart.cartItems.map((item) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            purchasedPrice: item.variant.discountedPrice,
                        })),
                    },
                },
            });

            for (const item of cart.cartItems) {
                await tx.sneakerVariant.update({
                    where: {id: item.variantId},
                    data: {
                        stock: {decrement: item.quantity},
                    },
                });
            }

            await tx.cartItem.deleteMany({
                where: {cartId: cart.id},
            });

            return newOrder;
        });

        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Checkout Failed'});
    }
}

async function getUserOrders(req, res) {
    try {
        const orders = await prisma.order.findMany({
            where: {userId: req.user.userId},
            include: {
                orderItems: {
                    include: {variant: true},
                },
            },
        });

        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch Orders'});
    }
}

async function getOrderById(req, res) {
    try {
        const orderId = Number(req.params.id);

        const order = await prisma.order.findUnique({
            where: {id: orderId},
            include: {
                orderItems: {
                    include: {variant: true},
                },
            },
        });

        if (!order) return res.status(404).json({error: 'Invalid order'});

        if (order.userId !== req.user.userId) {
            return res.status(404).json({error: 'Invalid order'});
        }

        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch order'});
    }
}

async function updateOrderStatus(req, res) {
    try {
        const orderId = Number(req.params.id);
        const {newStatus} = req.body;

        const order = await prisma.order.findUnique({
            where: {id: orderId},
        });

        if (!order) return res.status(404).json({error: 'Invalid Order'});

        if (order.userId !== req.user.userId) {
            return res.status(404).json({error: 'Invalid Order'});
        }

        if (!userAllowedStatuses.includes(newStatus)) {
            return res.status(403).json({error: 'Not authorized to perform this task'});
        }

        if (!validTransitions[order.status].includes(newStatus)) {
            return res.status(400).json({error: 'Invalid transition request'});
        }

        await prisma.order.update({
            where: {id: orderId},
            data: {status: newStatus},
        });

        res.status(200).json({message: 'Order status updated'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to update order status'});
    }
}

module.exports = {checkout, getUserOrders, getOrderById, updateOrderStatus};