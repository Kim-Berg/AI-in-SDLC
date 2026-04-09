import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface ProductPalette {
  base: string;
  accent: string;
  ink: string;
  highlight: string;
}

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  eyebrow: string;
  palette: ProductPalette;
}

function createProductImage(name: string, category: string, eyebrow: string, palette: ProductPalette): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.base}" />
          <stop offset="100%" stop-color="${palette.accent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)" rx="56" />
      <circle cx="980" cy="220" r="200" fill="${palette.highlight}" opacity="0.24" />
      <circle cx="200" cy="1060" r="260" fill="#ffffff" opacity="0.08" />
      <rect x="96" y="96" width="1008" height="1008" rx="40" fill="#ffffff" opacity="0.08" />
      <text x="116" y="176" fill="#fff7ef" font-size="34" font-family="Segoe UI, sans-serif" letter-spacing="5">${category.toUpperCase()}</text>
      <text x="116" y="910" fill="#fffdf8" font-size="110" font-family="Georgia, serif" font-weight="700">ZAVA</text>
      <text x="116" y="1002" fill="#fff7ef" font-size="56" font-family="Segoe UI, sans-serif">${eyebrow}</text>
      <text x="116" y="1080" fill="${palette.ink}" font-size="46" font-family="Segoe UI, sans-serif">${name}</text>
      <path d="M824 470c0-108-86-194-194-194H442c26 24 42 58 42 96 0 73-59 132-132 132-29 0-56-9-78-25v93c0 117 95 212 212 212h288c117 0 212-95 212-212V470z" fill="#fff6ec" opacity="0.94"/>
      <path d="M514 390c0-65-53-118-118-118-44 0-82 24-102 59 49-6 106 7 145 43 39 37 56 92 50 141 15-18 25-42 25-69V390z" fill="#f6dcc2" opacity="0.8"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const productSeeds: ProductSeed[] = [
  {
    name: 'Zava Atlas Espresso Blend',
    description: 'A structured espresso roast with dark cacao, candied orange, and a velvet finish built for flat whites and straight shots.',
    price: 1899,
    category: 'Coffee',
    stock: 80,
    eyebrow: 'Signature Roast',
    palette: { base: '#5a3422', accent: '#9e603f', ink: '#f3d7bd', highlight: '#f5c794' },
  },
  {
    name: 'Zava Daybreak Filter Roast',
    description: 'A bright everyday brew with bergamot lift, caramel sweetness, and a clean finish for slow mornings and all-day refills.',
    price: 1799,
    category: 'Coffee',
    stock: 74,
    eyebrow: 'Morning Ritual',
    palette: { base: '#7a5334', accent: '#d19a59', ink: '#fff0d5', highlight: '#ffe2b8' },
  },
  {
    name: 'Zava Solstice Cold Brew Flight',
    description: 'Three small-lot cold brew profiles designed for tasting pours, hosting trays, and a high-end retail demo shelf.',
    price: 2499,
    category: 'Coffee',
    stock: 48,
    eyebrow: 'Limited Drop',
    palette: { base: '#3b2826', accent: '#6c4f47', ink: '#f7e8dc', highlight: '#e6bcb5' },
  },
  {
    name: 'Zava Studio Pour-Over Kit',
    description: 'A matte ceramic dripper, borosilicate server, and measured filter set tuned for precise home brewing without visual clutter.',
    price: 12900,
    category: 'Brewing Gear',
    stock: 26,
    eyebrow: 'Barista Setup',
    palette: { base: '#29333a', accent: '#59707e', ink: '#d6e8ef', highlight: '#9fc4cf' },
  },
  {
    name: 'Zava Copper Drip Kettle',
    description: 'A premium gooseneck kettle with balanced pour control, induction compatibility, and a silhouette that reads well on stage.',
    price: 9200,
    category: 'Brewing Gear',
    stock: 19,
    eyebrow: 'Precision Pour',
    palette: { base: '#5f3727', accent: '#b56f49', ink: '#fce3d3', highlight: '#f4b58d' },
  },
  {
    name: 'Zava Nomad Travel Tumbler',
    description: 'Double-wall insulated drinkware in a brushed clay finish that keeps espresso hot and the product shelf visually cohesive.',
    price: 4200,
    category: 'Accessories',
    stock: 65,
    eyebrow: 'Carry Everyday',
    palette: { base: '#35443d', accent: '#708b76', ink: '#e8f1eb', highlight: '#c0d3c4' },
  },
  {
    name: 'Zava Evening Ritual Candle',
    description: 'A cedar, neroli, and espresso wax blend designed to extend the coffee ritual into hospitality, gifting, and evening ambiance.',
    price: 3600,
    category: 'Home Ritual',
    stock: 34,
    eyebrow: 'Atmosphere Layer',
    palette: { base: '#40304d', accent: '#8b6b9d', ink: '#f3eafd', highlight: '#d8c2ec' },
  },
  {
    name: 'Zava Canvas Market Tote',
    description: 'Heavyweight utility tote sized for beans, brewer gear, and a laptop so the brand extends naturally into work and travel.',
    price: 5400,
    category: 'Lifestyle',
    stock: 42,
    eyebrow: 'Storefront Carry',
    palette: { base: '#4a4034', accent: '#93806d', ink: '#f2eadf', highlight: '#dfceb4' },
  },
];

const products = productSeeds.map((product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  stock: product.stock,
  imageUrl: createProductImage(product.name, product.category, product.eyebrow, product.palette),
}));

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
      name: 'Maya Chen',
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
