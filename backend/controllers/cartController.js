const prisma = require('../lib/prisma');

async function getCart(req, res) {
    try {
        const cart = await prisma.cart.upsert({
            where: {userId: req.user.userId},
            update: {},
            create: {userId: req.user.userId},
            include: {
                cartItems: {
                    include: {
                        variant: {
                            include: {
                                colorway: {
                                    include: {sneaker: true},
                                },
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch Cart'});
    }
}

async function addToCard(req, res) {
    try {
        const {variantId, quantity} = req.body;
        const variantIdInt = Number(variantId);
        const quantityInt = Number(quantity);
        
        if (!variantIdInt || !quantityInt || quantityInt<1) {
            return res.status(400).json({error: 'variantId and a valid quantity are required'});
        }

        const variant = await prisma.sneakerVariant.findUnique({
            where: {id: variantIdInt},
        });

        if (!variant) return res.status(400).json({error: 'Variant not found'});

        const cart = await prisma.cart.upsert({
            where: {userId: req.user.userId},
            update: {},
            create: {userId: req.user.userId},
        });

        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId: variantIdInt,
                }
            }
        });

        const totalRequestedQuantity = (existingItem?.quantity || 0) + quantityInt;

        if (totalRequestedQuantity > variant.stock) {
            return res.status(400).json({error: `Only ${variant.stock} in stock`});
        }

        const cartItem = await prisma.cartItem.upsert({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId: variantIdInt,
                },
            },
            update: {quantity: totalRequestedQuantity},
            create: {
                cartId: cart.id,
                variantId: variantIdInt,
                quantity: totalRequestedQuantity,
            },
        });

        res.status(200).json(cartItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to add item to cart'});
    }
}

async function removeFromCart(req, res) {
    try {
        const cartItemId = Number(req.params.id);

        const cartItem = await prisma.cartItem.findUnique({
            where: {id: cartItemId},
            include: {cart: true},
        });

        if (!cartItem) return res.status(404).json({error: 'Invalid Cart item'});

        if (cartItem.cart.userId !== req.user.userId) {
            return res.status(404).json({error: 'Invalid Cart item'});
        }

        const deleteCartItem = await prisma.cartItem.delete({
            where: {id: cartItemId},
        });

        res.status(200).json({message: 'Item deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to delete the item'});
    }
}

async function updateCartItemQuantity(req, res) {
    try {
        const cartItemId = Number(req.params.id);
        const {delta} = req.body;

        if (!delta || !Number.isInteger(delta)) {
            return res.status(400).json({error: 'A valid integer delta is required'});
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: {id: cartItemId},
            include: {cart: true, variant: true},
        });

        if (!cartItem) return res.status(404).json({error: 'Invalid cart item'});

        if (cartItem.cart.userId !== req.user.userId) {
            return res.status(404).json({error: 'Invalid cart item'});
        }

        const newQuantity = cartItem.quantity + delta;

        if (newQuantity <= 0) {
            await prisma.cartItem.delete({where: {id: cartItemId}});
            return res.status(200).json({message: 'Item removed from cart'});
        }

        if (newQuantity > cartItem.variant.stock) {
            return res.status(400).json({error: `Only ${cartItem.variant.stock} in stock`});
        }

        const updatedItem = await prisma.cartItem.update({
            where: {id: cartItemId},
            data: {quantity: newQuantity},
        });

        res.status(200).json(updatedItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to update cart item'});        
    }
}

module.exports = {getCart, addToCard, removeFromCart, updateCartItemQuantity};