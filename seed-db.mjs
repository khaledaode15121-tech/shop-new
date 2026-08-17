import { drizzle } from "drizzle-orm/mysql2";
import { products } from "./drizzle/schema.ts";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const seedProducts = [
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "هواتف ذكية",
    description: "أحدث هاتف من Apple بمعالج A17 Pro وكاميرا ثلاثية متقدمة وشاشة Super Retina XDR",
    price: "4999.00",
    oldPrice: "5499.00",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
      "https://images.unsplash.com/photo-1592286927505-1def25e63e67?w=500&q=80",
    ],
    rating: "4.9",
    reviewCount: 128,
    stock: 50,
    badge: "الأكثر مبيعاً",
    badgeColor: "bg-blue-600",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "هواتف ذكية",
    description: "هاتف رائد من Samsung بمعالج Snapdragon 8 Gen 3 وكاميرا 200 ميجابكسل",
    price: "4299.00",
    oldPrice: "4799.00",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
    ],
    rating: "4.8",
    reviewCount: 95,
    stock: 45,
    badge: "جديد",
    badgeColor: "bg-green-600",
  },
  {
    name: "MacBook Pro M3",
    brand: "Apple",
    category: "لابتوبات",
    description: "لابتوب احترافي بمعالج Apple M3 وشاشة Retina وبطارية تدوم 18 ساعة",
    price: "7999.00",
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
    ],
    rating: "4.9",
    reviewCount: 64,
    stock: 20,
    badge: "مميز",
    badgeColor: "bg-purple-600",
  },
  {
    name: "AirPods Pro 2",
    brand: "Apple",
    category: "سماعات",
    description: "سماعات لاسلكية بتقنية إلغاء الضوضاء النشطة وجودة صوت استثنائية",
    price: "899.00",
    oldPrice: "1099.00",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
    ],
    rating: "4.7",
    reviewCount: 210,
    stock: 100,
    badge: "خصم 18%",
    badgeColor: "bg-orange-500",
  },
  {
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "ساعات ذكية",
    description: "ساعة ذكية بشاشة Always-On وميزات صحية متقدمة وتصميم أنيق",
    price: "1599.00",
    oldPrice: "1799.00",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    ],
    rating: "4.8",
    reviewCount: 87,
    stock: 35,
    badge: "عرض محدود",
    badgeColor: "bg-red-500",
  },
  {
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    category: "لابتوبات",
    description: "تابلت قوي بشاشة AMOLED وقلم S Pen ومعالج Snapdragon 8 Gen 2",
    price: "2799.00",
    oldPrice: "3199.00",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80",
    ],
    rating: "4.6",
    reviewCount: 53,
    stock: 25,
    badge: "خصم 12%",
    badgeColor: "bg-orange-500",
  },
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "سماعات",
    description: "سماعات رأس احترافية بأفضل تقنية إلغاء ضوضاء وصوت عالي الجودة",
    price: "2299.00",
    oldPrice: "2699.00",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
    ],
    rating: "4.8",
    reviewCount: 142,
    stock: 40,
    badge: "الأفضل",
    badgeColor: "bg-indigo-600",
  },
  {
    name: "Dell XPS 15",
    brand: "Dell",
    category: "لابتوبات",
    description: "لابتوب عالي الأداء بمعالج Intel Core i9 وكرت رسوميات RTX 4070",
    price: "6499.00",
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=500&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
    ],
    rating: "4.7",
    reviewCount: 78,
    stock: 15,
    badge: "قوي",
    badgeColor: "bg-red-600",
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    category: "هواتف ذكية",
    description: "هاتف ذكي بمعالج Tensor G3 وكاميرا بتقنية AI متقدمة",
    price: "3799.00",
    oldPrice: "4199.00",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
    ],
    rating: "4.6",
    reviewCount: 65,
    stock: 30,
    badge: "ذكي",
    badgeColor: "bg-blue-500",
  },
  {
    name: "Xiaomi 13 Ultra",
    brand: "Xiaomi",
    category: "هواتف ذكية",
    description: "هاتف بكاميرا احترافية بتعاون مع Leica ومعالج Snapdragon 8 Gen 2",
    price: "2899.00",
    oldPrice: "3299.00",
    image: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
      "https://images.unsplash.com/photo-1592286927505-1def25e63e67?w=500&q=80",
    ],
    rating: "4.5",
    reviewCount: 45,
    stock: 28,
    badge: "عرض",
    badgeColor: "bg-yellow-600",
  },
  {
    name: "OnePlus 12",
    brand: "OnePlus",
    category: "هواتف ذكية",
    description: "هاتف سريع بمعالج Snapdragon 8 Gen 3 وشحن سريع 100W",
    price: "2499.00",
    oldPrice: "2899.00",
    image: "https://images.unsplash.com/photo-1592286927505-1def25e63e67?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1592286927505-1def25e63e67?w=500&q=80",
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
    ],
    rating: "4.6",
    reviewCount: 72,
    stock: 32,
    badge: "سريع",
    badgeColor: "bg-green-600",
  },
  {
    name: "iPad Pro 12.9",
    brand: "Apple",
    category: "لابتوبات",
    description: "تابلت احترافي بمعالج M2 وشاشة Liquid Retina XDR",
    price: "3999.00",
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
    ],
    rating: "4.8",
    reviewCount: 91,
    stock: 22,
    badge: "احترافي",
    badgeColor: "bg-purple-600",
  },
  {
    name: "Beats Studio Pro",
    brand: "Beats",
    category: "سماعات",
    description: "سماعات احترافية بتقنية إلغاء ضوضاء وصوت عالي الجودة",
    price: "1599.00",
    oldPrice: "1899.00",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    ],
    rating: "4.5",
    reviewCount: 58,
    stock: 38,
    badge: "احترافي",
    badgeColor: "bg-red-600",
  },
  {
    name: "Samsung Galaxy Watch 6",
    brand: "Samsung",
    category: "ساعات ذكية",
    description: "ساعة ذكية بنظام Wear OS 4 وميزات صحية متقدمة",
    price: "1199.00",
    oldPrice: "1399.00",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80",
    ],
    rating: "4.4",
    reviewCount: 62,
    stock: 40,
    badge: "ذكية",
    badgeColor: "bg-blue-600",
  },
  {
    name: "Lenovo ThinkPad X1",
    brand: "Lenovo",
    category: "لابتوبات",
    description: "لابتوب عملي بمعالج Intel Core i7 وبطارية طويلة الأمد",
    price: "4199.00",
    oldPrice: "4699.00",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
      "https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=500&q=80",
    ],
    rating: "4.6",
    reviewCount: 55,
    stock: 18,
    badge: "عملي",
    badgeColor: "bg-gray-600",
  },
];

async function seedDatabase() {
  try {
    const db = drizzle(DATABASE_URL);

    console.log("🌱 جاري إدراج البيانات الأولية...");

    for (const product of seedProducts) {
      await db.insert(products).values({
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        images: JSON.stringify(product.images),
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        badge: product.badge,
        badgeColor: product.badgeColor,
      });

      console.log(`✅ تم إضافة: ${product.name}`);
    }

    console.log("\n✨ تم إدراج جميع المنتجات بنجاح!");
    console.log(`📊 عدد المنتجات المضافة: ${seedProducts.length}`);

    await connection.end();
  } catch (error) {
    console.error("❌ خطأ أثناء إدراج البيانات:", error);
    process.exit(1);
  }
}

seedDatabase();
