import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  date,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  token: text("token"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Category Table ─────────────────────────────────────────────────────────
export const category = mysqlTable("category", {
  id: int("id").autoincrement().primaryKey(),
  categoryCode: varchar("categoryCode", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof category.$inferSelect;
export type InsertCategory = typeof category.$inferInsert;

// ─── Brand Table ───────────────────────────────────────────────────────────
export const brand = mysqlTable("brand", {
  id: int("id").autoincrement().primaryKey(),
  brandCode: varchar("brandCode", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brand.$inferSelect;
export type InsertBrand = typeof brand.$inferInsert;

// ─── Products Table ───────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  productCode: varchar("productCode", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  categoryId: int("categoryId"),
  brandId: int("brandId"),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  oldPrice: decimal("oldPrice", { precision: 10, scale: 2 }),
  isRentable: boolean("isRentable").default(false).notNull(),
  isSellable: boolean("isSellable").default(true).notNull(),
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
  rentalPrice: decimal("rentalPrice", { precision: 10, scale: 2 }),
  image: text("image"), // URL to image
  images: json("images").$type<string[]>(), // Array of image URLs
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  stock: int("stock").default(0),
  isOnSale: boolean("isOnSale").default(false).notNull(),
  badge: varchar("badge", { length: 100 }),
  badgeColor: varchar("badgeColor", { length: 50 }),
  color: varchar("color", { length: 100 }),
  size: varchar("size", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Shopping Cart Table ──────────────────────────────────────────────────────
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  rentalDate: date("rentalDate", { mode: "string" }),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ─── Rental Requests & Bookings ───────────────────────────────────────────────
export const rentalRequests = mysqlTable("rentalRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  rentalDate: date("rentalDate", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["pending", "unavailable", "approved", "cancelled", "returned"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RentalRequest = typeof rentalRequests.$inferSelect;
export type InsertRentalRequest = typeof rentalRequests.$inferInsert;

export const rentalBookings = mysqlTable("rentalBookings", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  rentalDate: date("rentalDate", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["booked", "available"]).default("booked").notNull(),
  quantity: int("quantity").default(1).notNull(),
  rentalPrice: decimal("rentalPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  payments: decimal("payments", { precision: 10, scale: 2 }).default("0").notNull(),
  remaining: decimal("remaining", { precision: 10, scale: 2 }).default("0").notNull(),
  rentalRequestId: int("rentalRequestId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RentalBooking = typeof rentalBookings.$inferSelect;
export type InsertRentalBooking = typeof rentalBookings.$inferInsert;

// ─── Wishlist Table ───────────────────────────────────────────────────────────
export const wishlistItems = mysqlTable("wishlistItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

// ─── Reviews & Ratings Table ──────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }).notNull(),
  comment: text("comment"),
  helpful: int("helpful").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Orders Table (for future use) ────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]).default("pending"),
  paymentStatus: mysqlEnum("paymentStatus", [
    "unpaid",
    "paid",
    "refunded",
  ]).default("unpaid").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }).notNull(),
  customerName: text("customerName"),
  customerPhone: varchar("customerPhone", { length: 20 }),
  shippingAddress: text("shippingAddress"),
  estimatedDeliveryMinutes: int("estimatedDeliveryMinutes"),
  items: json("items").$type<
    Array<{
      productId: number;
      quantity: number;
      price: number;
      title?: string | null;
      image?: string | null;
    }>
  >(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
