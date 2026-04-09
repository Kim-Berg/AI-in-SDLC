import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Zava Classic Sneakers',
    description: 'Timeless sneakers crafted with premium leather and cushioned soles for all-day comfort.',
    price: 12999,
    imageUrl: 'https://picsum.photos/seed/sneakers/400/400',
    category: 'Footwear',
    stock: 50,
  },
  {
    name: 'Zava Denim Jacket',
    description: 'Rugged denim jacket with a modern slim fit. Perfect layering piece for any season.',
    price: 8999,
    imageUrl: 'https://picsum.photos/seed/denim/400/400',
    category: 'Outerwear',
    stock: 30,
  },
  {
    name: 'Zava Performance T-Shirt',
    description: 'Moisture-wicking performance tee designed for workouts and everyday wear.',
    price: 3499,
    imageUrl: 'https://picsum.photos/seed/tshirt/400/400',
    category: 'Tops',
    stock: 100,
  },
  {
    name: 'Zava Leather Backpack',
    description: 'Full-grain leather backpack with padded laptop compartment and organizer pockets.',
    price: 15999,
    imageUrl: 'https://picsum.photos/seed/backpack/400/400',
    category: 'Accessories',
    stock: 20,
  },
  {
    name: 'Zava Slim Chinos',
    description: 'Stretch cotton chinos with a tapered fit. Available in six colorways.',
    price: 6499,
    imageUrl: 'https://picsum.photos/seed/chinos/400/400',
    category: 'Bottoms',
    stock: 75,
  },
  {
    name: 'Zava Wool Beanie',
    description: 'Soft merino wool beanie with ribbed cuff. Lightweight warmth for cold days.',
    price: 2499,
    imageUrl: 'https://picsum.photos/seed/beanie/400/400',
    category: 'Accessories',
    stock: 120,
  },
  {
    name: 'Zava Running Shorts',
    description: 'Lightweight running shorts with built-in liner and reflective details.',
    price: 4499,
    imageUrl: 'https://picsum.photos/seed/shorts/400/400',
    category: 'Bottoms',
    stock: 60,
  },
  {
    name: 'Zava Aviator Sunglasses',
    description: 'Polarized aviator sunglasses with titanium frames and UV400 protection.',
    price: 9999,
    imageUrl: 'https://picsum.photos/seed/sunglasses/400/400',
    category: 'Accessories',
    stock: 40,
  },
];

async function main() {
  console.log('🌱 Seeding Zava database...');

  // Clean existing data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({
    data: {
      email: 'admin@zava.com',
      password: adminPassword,
      name: 'Zava Admin',
      role: 'admin',
    },
  });

  // Create test customer
  const customerPassword = await bcrypt.hash('Customer123!', 10);
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Jane Doe',
      role: 'customer',
    },
  });

  // Create products
  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ Seeded ${products.length} products, 2 users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
