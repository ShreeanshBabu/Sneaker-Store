const prisma = require('../lib/prisma')

async function main() {
    const Air_Max_90 = await prisma.sneaker.create({
        data: {
            name: 'Air Max 90',
            description: 'Classic runner silhouette with visible Air cushioning.',
            brand: 'Nike',
            mrp: 12000,
            colorways: {
                create: [
                    {
                        color: 'Black',
                        colorCode: '#000000',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 11000, stock: 10},
                                {size: '9', discountedPrice: 11000, stock: 15},
                                {size: '10', discountedPrice: 11000, stock: 0},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/d/ad22b92Nike-CN8490-003_1.jpg?rnd=20200526195200&tr=w-1080',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                    {
                        color: 'White',
                        colorCode: '#ffffff',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 11099, stock: 20},
                                {size: '9', discountedPrice: 11099, stock: 0},
                                {size: '10', discountedPrice: 11099, stock: 15},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/d/ad22b92Nike-DH8010-100_1.jpg?rnd=20200526195200&tr=w-1080',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    const Air_Force_1 = await prisma.sneaker.create({
        data: {
            name: 'Air Force 1',
            description: 'Comfortable, durable and timeless it\'s number one for a reason.',
            brand: 'Nike',
            mrp: 10000,
            colorways: {
                create: [
                    {
                        color: 'Black',
                        colorCode: '#000000',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 8500, stock: 20},
                                {size: '9', discountedPrice: 8500, stock: 5},
                                {size: '10', discountedPrice: 8500, stock: 0},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/d/ad22b92Nike-CW2288-001_1.jpg?rnd=20200526195200&tr=w-1080',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                    {
                        color: 'White',
                        colorCode: '#ffffff',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 8600, stock: 0},
                                {size: '9', discountedPrice: 8600, stock: 10},
                                {size: '10', discountedPrice: 8600, stock: 15},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/d/ad22b92Nike-CW2288-111_1.jpg?rnd=20200526195200&tr=w-1080',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                    {
                        color: 'Red',
                        colorCode: '#ae2d2d',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 8800, stock: 0},
                                {size: '9', discountedPrice: 8800, stock: 5},
                                {size: '10', discountedPrice: 8800, stock: 10},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/d/ad22b92Nike-IM5752-600_1.jpg?rnd=20200526195200&tr=w-1080',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    const Sambas = await prisma.sneaker.create({
        data: {
            name: 'Sambas OG',
            description: 'Adidas Originals.',
            brand: 'Adidas',
            mrp: 15000,
            colorways: {
                create: [
                    {
                        color: 'Red',
                        colorCode: '#a12222',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 12000, stock: 20},
                                {size: '9', discountedPrice: 12000, stock: 5},
                                {size: '10', discountedPrice: 12000, stock: 10},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/6fca7da2abfa47359e6924684a2f694c_9366/SAMBA_OG_SHOES_Burgundy_KJ2788_01_00_standard.jpg',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                    {
                        color: 'Blue',
                        colorCode: '#1c2c6c',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 12500, stock: 0},
                                {size: '9', discountedPrice: 12500, stock: 10},
                                {size: '10', discountedPrice: 12500, stock: 15},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/83e640f71cc04410a84ec2bbfccc532e_9366/SAMBA_OG_SHOES_Blue_KK2273_01_00_standard.jpg',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                    {
                        color: 'Green',
                        colorCode: '#034103',
                        variants: {
                            create: [
                                {size: '8', discountedPrice: 13000, stock: 10},
                                {size: '9', discountedPrice: 13000, stock: 0},
                                {size: '10', discountedPrice: 13000, stock: 5},
                            ],
                        },
                        images: {
                            create: [
                                {
                                    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/dae3937f80cc42a2b35faf86bfdb07db_9366/SAMBA_OG_SHOES_Green_KK2274_01_00_standard.jpg',
                                    indexNo: 0, isThumbnail: true
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    console.log('Seeded:', Air_Max_90, Air_Force_1, Sambas);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });