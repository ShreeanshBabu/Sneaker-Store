const prisma = require('../lib/prisma');

async function getAllSneakers(req, res) {
    try {
        const sneakers = await prisma.sneaker.findMany({
            include:{
                colorways:{
                    include:{
                        variants: true,
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
            where: {id: Number(id)},
            include: {
                colorways: {
                    include: {
                        variants: true,
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

module.exports = {getAllSneakers, getSneakerById};