import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  Product,
  products,
  CartItem,
  cartItems,
  WishlistItem,
  wishlistItems,
  Review,
  reviews,
  Category,
  InsertCategory,
  Brand,
  InsertBrand,
  Order,
  orders,
  InsertOrder,
  category as categoryTable,
  brand as brandTable,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { eq, and, or, like, gte, lte, inArray, desc } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

export function resolveDatabaseUrl() {
  return process.env.DATABASE_URL || ENV.databaseUrl || "";
}

export function extractInsertId(result: unknown): number | undefined {
  if (Array.isArray(result)) {
    for (const item of result) {
      const nestedInsertId = extractInsertId(item);
      if (typeof nestedInsertId === "number") {
        return nestedInsertId;
      }
    }
    return undefined;
  }

  if (typeof result !== "object" || result === null) {
    return undefined;
  }

  const record = result as { insertId?: unknown };
  if (typeof record.insertId === "number") {
    return record.insertId;
  }

  return undefined;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    const databaseUrl = resolveDatabaseUrl();
    if (!databaseUrl) {
      console.warn("[Database] No database URL configured");
      return null;
    }

    try {
      _db = drizzle(databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = [
      "name",
      "email",
      "phone",
      "address",
      "loginMethod",
      "token",
    ] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by id: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (err: any) {
    // Detect common migration mismatch (missing column) and surface a clearer message
    const msg = err && err.message ? String(err.message) : String(err);
    if (
      /Unknown column|doesn't exist|column not found|Unknown column/.test(msg)
    ) {
      console.error(
        `[Database] Query failed selecting users.email. Possible schema mismatch. Error: ${msg}`
      );
      console.error(
        `[Database] Ensure migrations have run (run 'pnpm run db:push') or add the missing columns (e.g. run ALTER TABLE users ADD COLUMN token TEXT NULL;)`
      );
    } else {
      console.error("[Database] Failed getUserByEmail:", err);
    }
    throw err;
  }
}

export async function updateUserById(
  id: number,
  values: Partial<
    Pick<
      InsertUser,
      | "openId"
      | "name"
      | "email"
      | "phone"
      | "address"
      | "loginMethod"
      | "lastSignedIn"
      | "role"
      | "token"
    >
  >
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return undefined;
  }

  await db.update(users).set(values).where(eq(users.id, id));
  return getUserById(id);
}

export async function getAllUsersAdmin() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function createUserAdmin(data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const email = data.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("البريد الإلكتروني مستخدم بالفعل");
  }

  const openId = `local:${email}`;
  const payload: InsertUser = {
    openId,
    name: data.name.trim(),
    email,
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null,
    role: data.role || "user",
    loginMethod: "email",
    lastSignedIn: new Date(),
  };

  const result = await db.insert(users).values(payload);
  const insertId = extractInsertId(result);
  if (typeof insertId === "number") {
    return getUserById(insertId);
  }
  return undefined;
}

export async function updateUserAdmin(
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: "user" | "admin";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values: Partial<
    Pick<InsertUser, "name" | "email" | "phone" | "address" | "role" | "openId">
  > = {};

  if (data.name !== undefined) values.name = data.name.trim();
  if (data.phone !== undefined) values.phone = data.phone.trim() || null;
  if (data.address !== undefined) values.address = data.address.trim() || null;
  if (data.role !== undefined) values.role = data.role;

  if (data.email !== undefined) {
    const email = data.email.trim().toLowerCase();
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== id) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل");
    }
    values.email = email;
    values.openId = `local:${email}`;
  }

  if (Object.keys(values).length === 0) {
    return getUserById(id);
  }

  await db.update(users).set(values).where(eq(users.id, id));
  return getUserById(id);
}

export async function deleteUserAdmin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.userId, id));
  await db.delete(wishlistItems).where(eq(wishlistItems.userId, id));
  await db.delete(reviews).where(eq(reviews.userId, id));
  await db.delete(users).where(eq(users.id, id));
  return true;
}

// ─── Product Functions ────────────────────────────────────────────────────────
export async function getProducts(limit?: number) {
  const db = await getDb();
  if (!db) return [];

  if (limit) {
    return db.select().from(products).limit(limit);
  }
  return db.select().from(products);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(products).where(eq(products.category, category));
}

// ─── Cart Functions ───────────────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      productName: products.name,
      productImage: products.image,
      productPrice: products.price,
      productStock: products.stock,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(
  userId: number,
  productId: number,
  quantity: number = 1
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    )
    .limit(1);

  if (existing.length > 0) {
    // Update quantity
    return db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
      );
  } else {
    // Insert new cart item
    return db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeFromCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(cartItems)
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    );
}

export async function updateCartItemQuantity(
  userId: number,
  productId: number,
  quantity: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    return removeFromCart(userId, productId);
  }

  return db
    .update(cartItems)
    .set({ quantity })
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    );
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function createOrderFromCart(
  userId: number,
  paymentMethod: string,
  customerName: string | null,
  customerPhone: string | null,
  shippingAddress: string | null
) {
  if (userId <= 0) {
    throw new Error("معرّف المستخدم غير صالح لإنشاء الطلب");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cart = await getCartItems(userId);
  if (cart.length === 0) {
    throw new Error("عربة التسوق فارغة");
  }

  const productIds = cart.map(item => item.productId);
  const productsInCart = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
  const productMap = new Map(
    productsInCart.map(product => [product.id, product])
  );

  const orderItems = cart.map(item => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`المنتج ${item.productId} غير موجود`);
    }
    const stock = product.stock ?? 0;
    if (stock < item.quantity) {
      throw new Error(
        `الكمية المطلوبة من المنتج ${product.name || item.productId} غير متوفرة`
      );
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: parseFloat(product.price.toString()),
      title: product.name || `المنتج ${item.productId}`,
      image: product.image || null,
      stock,
    };
  });

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalPriceFormatted = totalPrice.toFixed(2);

  await db.transaction(async tx => {
    for (const item of orderItems) {
      const product = productMap.get(item.productId)!;
      const stock = product.stock ?? 0;
      await tx
        .update(products)
        .set({ stock: stock - item.quantity })
        .where(eq(products.id, product.id));
    }

    try {
      await tx.insert(orders).values({
        userId,
        totalPrice: totalPriceFormatted,
        status: "pending",
        paymentMethod,
        customerName,
        customerPhone,
        shippingAddress,
        items: orderItems.map(
          ({ productId, quantity, price, title, image }) => ({
            productId,
            quantity,
            price,
            title,
            image,
          })
        ),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        /Unknown column|doesn't exist|column not found|Unknown column/.test(
          message
        )
      ) {
        throw new Error(
          "خطأ في بنية جدول الطلبات. تأكد من أن التعديلات على قاعدة البيانات تم تطبيقها (run `pnpm run db:push` مع إعداد DATABASE_URL)."
        );
      }
      throw err;
    }

    await tx.delete(cartItems).where(eq(cartItems.userId, userId));
  });

  return {
    totalPrice,
    items: orderItems,
  };
}

export type OrderStatus = (typeof orders.$inferSelect)["status"];

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  const productIds = Array.from(
    new Set(
      orderRows.flatMap(order =>
        Array.isArray(order.items)
          ? order.items
              .filter(item => !item?.title || !item?.image)
              .map(item => item.productId)
          : []
      )
    )
  );

  if (productIds.length === 0) {
    return orderRows;
  }

  const productsById = new Map(
    (
      await db.select().from(products).where(inArray(products.id, productIds))
    ).map(product => [product.id, product])
  );

  return orderRows.map(order => {
    if (!Array.isArray(order.items)) {
      return order;
    }

    return {
      ...order,
      items: order.items.map(item => {
        const product = productsById.get(item.productId);
        const title =
          item.title && item.title.toString().trim()
            ? item.title
            : (product?.name ?? `المنتج ${item.productId}`);
        const image =
          item.image && item.image.toString().trim()
            ? item.image
            : (product?.image ?? null);
        return {
          ...item,
          title,
          image,
        };
      }),
    };
  });
}

export async function updateOrderStatus(
  userId: number,
  orderId: number,
  status: OrderStatus
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(orders)
    .set({ status })
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

  const updated = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  return updated.length > 0 ? updated[0] : null;
}

export async function updateOrderItems(
  userId: number,
  orderId: number,
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
    title?: string | null;
    image?: string | null;
  }>,
  paymentMethod?: string,
  shippingAddress?: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("الطلب غير موجود");
  }

  const order = existing[0];
  if (order.status === "delivered") {
    throw new Error("لا يمكن تعديل الطلب بعد التسليم");
  }

  const totalPrice = items
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const updatePayload: {
    items: typeof items;
    totalPrice: string;
    paymentMethod?: string;
    shippingAddress?: string | null;
  } = {
    items,
    totalPrice,
  };

  if (paymentMethod !== undefined) {
    updatePayload.paymentMethod = paymentMethod;
  }

  if (shippingAddress !== undefined) {
    updatePayload.shippingAddress = shippingAddress;
  }

  await db
    .update(orders)
    .set(updatePayload)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

  const updated = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  return updated.length > 0 ? updated[0] : null;
}

// ─── Wishlist Functions ───────────────────────────────────────────────────────
export async function getWishlistItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));
}

export async function addToWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0]; // Already in wishlist
  }

  return db.insert(wishlistItems).values({ userId, productId });
}

export async function removeFromWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    );
}

export async function isInWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    )
    .limit(1);

  return result.length > 0;
}

// ─── Review Functions ────────────────────────────────────────────────────────
export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reviews).where(eq(reviews.productId, productId));
}

export async function getUserReviews(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reviews).where(eq(reviews.userId, userId));
}

export async function createReview(
  userId: number,
  productId: number,
  rating: number,
  title: string,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  return db.insert(reviews).values({
    userId,
    productId,
    rating,
    title,
    comment,
    verified: true, // Can be set to false and verified later
  });
}

export async function updateReview(
  reviewId: number,
  rating: number,
  title: string,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  return db
    .update(reviews)
    .set({ rating, title, comment })
    .where(eq(reviews.id, reviewId));
}

export async function deleteReview(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(reviews).where(eq(reviews.id, reviewId));
}

export async function markReviewAsHelpful(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const review = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);
  if (review.length === 0) throw new Error("Review not found");

  const currentReview = review[0];
  if (!currentReview) throw new Error("Review not found");

  return db
    .update(reviews)
    .set({ helpful: (currentReview.helpful || 0) + 1 })
    .where(eq(reviews.id, reviewId));
}

// ─── Search & Filter Functions ───────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ name: categoryTable.name })
    .from(categoryTable)
    .where(eq(categoryTable.isActive, true));
  return result.map(r => r.name).filter(Boolean);
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(categoryTable).orderBy(desc(categoryTable.id));
}

export async function createCategoryAdmin(data: {
  name: string;
  categoryCode?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const payload: InsertCategory = {
    categoryCode: normalizeIdentifier(data.categoryCode, `CAT-${Date.now()}`),
    name: data.name,
    slug:
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    description: data.description,
    image: data.image,
    isActive: data.isActive ?? true,
  };

  const result = await db.insert(categoryTable).values(payload);
  const insertId = extractInsertId(result);
  if (typeof insertId === "number") {
    const created = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.id, insertId))
      .limit(1);
    return created[0] ?? null;
  }

  return null;
}

export async function updateCategoryAdmin(
  id: number,
  data: Partial<InsertCategory>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(categoryTable).set(data).where(eq(categoryTable.id, id));
  const updated = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.id, id))
    .limit(1);
  return updated[0] ?? null;
}

export async function deleteCategoryAdmin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(categoryTable).where(eq(categoryTable.id, id));
  return true;
}

export async function getBrands() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(brandTable)
    .where(eq(brandTable.isActive, true))
    .orderBy(desc(brandTable.id));
}

export async function getProductColors() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ color: products.color }).from(products);
  return Array.from(
    new Set(
      result
        .map(row => row.color)
        .filter((value): value is string => Boolean(value?.trim()))
    )
  );
}

export async function getProductSizes() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ size: products.size }).from(products);
  return Array.from(
    new Set(
      result
        .map(row => row.size)
        .filter((value): value is string => Boolean(value?.trim()))
    )
  );
}

export async function getAllBrands() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brandTable).orderBy(desc(brandTable.id));
}

export async function createBrandAdmin(data: {
  name: string;
  brandCode?: string;
  slug?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const payload: InsertBrand = {
    brandCode: normalizeIdentifier(data.brandCode, `SEC-${Date.now()}`),
    name: data.name,
    slug:
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    description: data.description,
    logo: data.logo,
    isActive: data.isActive ?? true,
  };

  const result = await db.insert(brandTable).values(payload);
  const insertId = extractInsertId(result);
  if (typeof insertId === "number") {
    const created = await db
      .select()
      .from(brandTable)
      .where(eq(brandTable.id, insertId))
      .limit(1);
    return created[0] ?? null;
  }

  return null;
}

export async function updateBrandAdmin(id: number, data: Partial<InsertBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(brandTable).set(data).where(eq(brandTable.id, id));
  const updated = await db
    .select()
    .from(brandTable)
    .where(eq(brandTable.id, id))
    .limit(1);
  return updated[0] ?? null;
}

export async function deleteBrandAdmin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(brandTable).where(eq(brandTable.id, id));
  return true;
}

export async function searchProducts(filters: {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  categories?: string[];
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  limit?: number;
}): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all products, sorted by newest first
  let results = await db.select().from(products).orderBy(products.id);
  console.log(`[DEBUG] Total products found in DB: ${results.length}`);
  results.reverse(); // Newest first (highest ID)

  // Apply filters on client side
  if (filters.query) {
    const searchTerm = filters.query.toLowerCase();
    results = results.filter(
      p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm)
    );
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    const minPrice = filters.minPrice;
    results = results.filter(p => parseFloat(p.price as any) >= minPrice);
  }
  if (filters.maxPrice !== undefined) {
    const maxPrice = filters.maxPrice;
    results = results.filter(p => parseFloat(p.price as any) <= maxPrice);
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    const minRating = filters.minRating;
    results = results.filter(p => parseFloat(p.rating as any) >= minRating);
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(p => filters.categories!.includes(p.category));
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    results = results.filter(p => filters.brands!.includes(p.brand));
  }

  // Color and size filters
  if (filters.colors && filters.colors.length > 0) {
    results = results.filter(p =>
      p.color ? filters.colors!.includes(p.color) : false
    );
  }
  if (filters.sizes && filters.sizes.length > 0) {
    results = results.filter(p =>
      p.size ? filters.sizes!.includes(p.size) : false
    );
  }

  // Limit results
  const limit = filters.limit || 50;
  return results.slice(0, limit);
}

// Dashboard Statistics Functions
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get dashboard stats: database not available"
    );
    return null;
  }

  try {
    // Get total products count
    const totalProducts = await db.select().from(products);

    // Get total users count
    const totalUsers = await db.select().from(users);

    // Get total reviews count
    const totalReviews = await db.select().from(reviews);

    // Get average rating
    const avgRating =
      totalReviews.length > 0
        ? (
            totalReviews.reduce(
              (sum, r) => sum + (parseInt(String(r.rating) || "0") || 0),
              0
            ) / totalReviews.length
          ).toFixed(1)
        : "0";

    return {
      totalProducts: totalProducts.length,
      totalUsers: totalUsers.length,
      totalReviews: totalReviews.length,
      averageRating: parseFloat(avgRating),
      topProducts: totalProducts
        .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        .slice(0, 5),
      recentReviews: totalReviews.slice(-5),
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    return null;
  }
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get products: database not available");
    return [];
  }

  try {
    return await db.select().from(products);
  } catch (error) {
    console.error("[Database] Failed to get products:", error);
    return [];
  }
}

function normalizeIdentifier(value: string | null | undefined, fallback: string) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
  return normalized || fallback;
}

function buildProductCode(
  brandCode: string | null | undefined,
  categoryCode: string | null | undefined,
  sequence: number
) {
  return `${normalizeIdentifier(brandCode, "SEC-000")}-${normalizeIdentifier(categoryCode, "CAT-000")}-${String(sequence).padStart(6, "0")}`;
}

export async function updateProductAdmin(
  id: number,
  data: Partial<Product> & {
    categoryId?: number | null;
    brandId?: number | null;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error(
      "Database not available. Please check your DATABASE_URL environment variable."
    );
  }

  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.oldPrice !== undefined) updateData.oldPrice = data.oldPrice;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isOnSale !== undefined) updateData.isOnSale = data.isOnSale;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.badgeColor !== undefined) updateData.badgeColor = data.badgeColor;
    if (data.color !== undefined) updateData.color = data.color || null;
    if (data.size !== undefined) updateData.size = data.size || null;
    if (data.isRentable !== undefined) {
      updateData.isRentable = data.isRentable;
      updateData.rentalPrice = data.isRentable
        ? data.rentalPrice || null
        : null;
    } else if (data.rentalPrice !== undefined) {
      updateData.rentalPrice = data.rentalPrice || null;
    }
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId ?? null;
      if (data.categoryId) {
        const categoryRow = await db
          .select()
          .from(categoryTable)
          .where(eq(categoryTable.id, data.categoryId))
          .limit(1);
        if (categoryRow[0]) updateData.category = categoryRow[0].name;
      }
    }
    if (data.brandId !== undefined) {
      updateData.brandId = data.brandId ?? null;
      if (data.brandId) {
        const brandRow = await db
          .select()
          .from(brandTable)
          .where(eq(brandTable.id, data.brandId))
          .limit(1);
        if (brandRow[0]) updateData.brand = brandRow[0].name;
      }
    }

    if (
      data.categoryId !== undefined ||
      data.brandId !== undefined ||
      data.brand !== undefined
    ) {
      const currentProduct = await getProductById(id);
      const finalBrandId =
        data.brandId !== undefined ? data.brandId : currentProduct?.brandId;
      const finalCategoryId =
        data.categoryId !== undefined
          ? data.categoryId
          : currentProduct?.categoryId;
      const [brandRow] = finalBrandId
        ? await db
            .select({ brandCode: brandTable.brandCode })
            .from(brandTable)
            .where(eq(brandTable.id, finalBrandId))
            .limit(1)
        : [];
      const [categoryRow] = finalCategoryId
        ? await db
            .select({ categoryCode: categoryTable.categoryCode })
            .from(categoryTable)
            .where(eq(categoryTable.id, finalCategoryId))
            .limit(1)
        : [];
      updateData.productCode = buildProductCode(
        brandRow?.brandCode,
        categoryRow?.categoryCode,
        id
      );
    }
    await db.update(products).set(updateData).where(eq(products.id, id));
    const updatedProduct = await getProductById(id);
    if (!updatedProduct) {
      throw new Error("Failed to retrieve updated product.");
    }
    return updatedProduct;
  } catch (error) {
    console.error("[Database] Failed to update product:", error);
    throw new Error(
      `Failed to update product: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function deleteProductAdmin(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error(
      "Database not available. Please check your DATABASE_URL environment variable."
    );
  }

  try {
    await db.delete(products).where(eq(products.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete product:", error);
    throw new Error(
      `Failed to delete product: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getAllReviewsAdmin() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get reviews: database not available");
    return [];
  }

  try {
    return await db.select().from(reviews);
  } catch (error) {
    console.error("[Database] Failed to get reviews:", error);
    return [];
  }
}

export async function deleteReviewAdmin(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete review: database not available");
    return false;
  }

  try {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete review:", error);
    return false;
  }
}

export async function createProductAdmin(data: {
  name: string;
  brand: string;
  category: string;
  categoryId?: number;
  brandId?: number;
  description?: string;
  price: string;
  oldPrice?: string;
  image?: string;
  stock?: number;
  isOnSale?: boolean;
  badge?: string;
  badgeColor?: string;
  color?: string;
  size?: string;
  isRentable?: boolean;
  rentalPrice?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error(
      "Database not available. Please check your DATABASE_URL environment variable."
    );
  }

  try {
    if (!data.categoryId || !data.brandId) {
      throw new Error("A product must be linked to both a section and a category.");
    }

    let categoryName = data.category;
    let brandName = data.brand;
    let categoryCode = "CAT-000";
    let brandCode = "SEC-000";

    if (data.categoryId) {
      const categoryRow = await db
        .select({ name: categoryTable.name, categoryCode: categoryTable.categoryCode })
        .from(categoryTable)
        .where(eq(categoryTable.id, data.categoryId))
        .limit(1);
      if (categoryRow[0]) {
        categoryName = categoryRow[0].name;
        categoryCode = categoryRow[0].categoryCode;
      }
    }

    if (data.brandId) {
      const brandRow = await db
        .select({ name: brandTable.name, brandCode: brandTable.brandCode })
        .from(brandTable)
        .where(eq(brandTable.id, data.brandId))
        .limit(1);
      if (brandRow[0]) {
        brandName = brandRow[0].name;
        brandCode = brandRow[0].brandCode;
      }
    }

    const result = await db.insert(products).values({
      name: data.name,
      brand: brandName,
      category: categoryName,
      categoryId: data.categoryId ?? null,
      brandId: data.brandId ?? null,
      description: data.description,
      price: data.price,
      oldPrice: data.oldPrice || null,
      image: data.image,
      stock: data.stock ?? 0,
      isOnSale: data.isOnSale ?? false,
      badge: data.badge,
      badgeColor: data.badgeColor,
      color: data.color || null,
      size: data.size || null,
      isRentable: data.isRentable ?? false,
      rentalPrice: data.isRentable ? data.rentalPrice || null : null,
      productCode: `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      rating: "0",
      reviewCount: 0,
    });

    const insertId = extractInsertId(result);
    if (typeof insertId === "number") {
      await db
        .update(products)
        .set({
          productCode: buildProductCode(brandCode, categoryCode, insertId),
        })
        .where(eq(products.id, insertId));
      const newProduct = await getProductById(insertId);
      if (newProduct) {
        return newProduct;
      }
    }

    const [latestProduct] = await db
      .select()
      .from(products)
      .orderBy(desc(products.id))
      .limit(1);
    if (!latestProduct) {
      throw new Error("Failed to retrieve newly created product.");
    }
    await db
      .update(products)
      .set({
        productCode: buildProductCode(
          brandCode,
          categoryCode,
          latestProduct.id
        ),
      })
      .where(eq(products.id, latestProduct.id));
    return getProductById(latestProduct.id);
  } catch (error) {
    console.error("[Database] Failed to create product:", error);
    throw new Error(
      `Failed to create product: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
