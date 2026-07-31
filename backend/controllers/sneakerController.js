const { error } = require('node:console');
const prisma = require('../lib/prisma');

async function getAllSneakers(req, res) {
    try {
        const sneakers = await prisma.sneaker.findMany({
            where: {isDeleted: false},
            include:{
                colorways:{
                    include:{
                        variants: {
                            where: {isDeleted: false},
                        },
                        images: true,
                    },
                },
            },
        });
        res.json(sneakers);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch sneakers'});
    }
}

async function getSneakerById(req, res) {
    try {
        const {id} = req.params;

        const sneaker = await prisma.sneaker.findUnique({
            where: {id: Number(id), isDeleted: false},
            include: {
                colorways: {
                    include: {
                        variants: {
                            where: {isDeleted: false},
                        },
                        images: true,
                    },
                },
            },
        });

        if (!sneaker) return res.status(404).json({message: 'Sneaker Not Found'});

        res.json(sneaker);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to fetch sneakers'});
    }
}

async function createSneaker(req, res) {
    try {
        const {name, description, brand, mrp, colorways} = req.body;

        if (!name || !description || !brand || !mrp || !Array.isArray(colorways) || colorways.length === 0) {
            return res.status(400).json({error: 'Missing required sneaker fields or colorways'});
        }

        const sneaker = await prisma.sneaker.create({
            data: {
                name,
                description,
                brand,
                mrp,
                colorways: {
                    create: colorways.map((colorway) => ({
                        color: colorway.color,
                        colorCode: colorway.colorCode,
                        variants: {
                            create: colorway.variants,
                        },
                        images: {
                            create: colorway.images,
                        },
                    })),
                },
            },
        });

        res.status(201).json({message: 'Sneaker added'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to add sneaker'});
    }
}

async function updateStock(req, res) {
    try {
        const variantId = Number(req.params.variantId);
        const {stock} = req.body;

        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({error: 'Stock must be a non-negative integer'});
        }

        const variant = await prisma.sneakerVariant.findUnique({
            where: {id: variantId},
        });

        if (!variant) return res.status(404).json({error: 'Invalid Variant'});

        await prisma.sneakerVariant.update({
            where: {id: variantId},
            data: {stock},
        });

        res.status(200).json({message: 'Stock updated'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to update stock'});
    }
}

async function deleteSneaker(req, res) {
    try {
        const sneakerId = Number(req.params.id);

        const sneaker = await prisma.sneaker.findUnique({
            where: {id: sneakerId},
        });

        if (!sneaker) return res.status(404).json({error: 'Sneaker not found'});

        await prisma.sneaker.update({
            where: {id: sneakerId},
            data: {isDeleted: true},
        });

        res.status(200).json({message: 'Sneaker deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to delete sneaker'});
    }
}

async function deleteVariant(req,res) {
    try {
        const variantId = Number(req.params.variantId);

        const variant = await prisma.sneakerVariant.findUnique({
            where: {id: variantId},
        });

        if (!variant) return res.status(404).json({error: 'Variant not found'});

        await prisma.sneakerVariant.update({
            where: {id: variantId},
            data: {isDeleted: true},
        });

        res.status(200).json({message: 'Variant deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to delete variant'});
    }
}

async function addVariantToColorway(req, res) {
    try {
        const sneakerId = Number(req.params.id);
        const {colorwayId, variants} = req.body;

        if (!colorwayId || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({error: 'Missing required colorwayId or variants'});
        }

        const sneaker = await prisma.sneaker.findUnique({
            where: {id: sneakerId},
        });

        if (!sneaker) return res.status(400).json({error: 'Invalid sneaker'});

        const colorway = await prisma.sneakerColorway.findUnique({
            where: {id: colorwayId},
        });

        if (!colorway) return res.status(400).json({error: 'Invalid colorway'})

        if (colorway.sneakerId !== sneakerId) {
            return res.status(400).json({error: 'This colorway does not belong to this sneaker'});
        }

        const existingVariants = await prisma.sneakerVariant.findMany({
            where: {colorwayId},
        });

        const existingSizes = existingVariants.map((v) => v.size);

        const variantsToCreate = variants.filter((variant) => !existingSizes.includes(variant.size));
        const duplicateVariants = variants.filter((variant) => existingSizes.includes(variant.size));

        if (variantsToCreate.length === 0) {
            return res.status(400).json({variants: {}, duplicate: duplicateVariants});
        }

        await prisma.sneakerVariant.createMany({
            data: variantsToCreate.map((variant) => ({
                colorwayId,
                size: variant.size,
                discountedPrice: variant.discountedPrice,
                stock: variant.stock,
            })),
        });
        
        const createdVariants = await prisma.sneakerVariant.findMany({
            where: {colorwayId},
        });

        res.status(201).json({variants: createdVariants, duplicate: duplicateVariants});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to add variant'});
    }
}

async function updateSneaker(req, res) {
    try {
        const sneakerId = Number(req.params.id);
        const {name, description, brand, mrp} = req.body;

        if (!name || !description || !brand || !mrp) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const sneaker = await prisma.sneaker.findUnique({where: {id: sneakerId}});
        if (!sneaker) return res.status(404).json({error: 'Sneaker not found'});

        const updated = await prisma.sneaker.update({
            where: {id: sneakerId},
            data: {name, description, brand, mrp},
        });

        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to update sneaker'});
    }
}

module.exports = {getAllSneakers, getSneakerById, createSneaker, updateStock, deleteSneaker, deleteVariant, addVariantToColorway, updateSneaker};