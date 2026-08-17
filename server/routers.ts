import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { sdk } from "./_core/sdk";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { buildLocalAuthenticatedUser, resolveLocalLoginProfile } from "./_core/localAuth";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    localLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existingUser = await db.getUserByEmail(input.email.trim().toLowerCase());
        const profile = resolveLocalLoginProfile(
          {
            email: input.email,
            name: input.name,
            phone: input.phone,
            address: input.address,
          },
          Boolean(existingUser),
          existingUser
        );

        let user: Awaited<ReturnType<typeof db.getUserByEmail>> | null = null;

        if (existingUser) {
          user = await db.updateUserById(existingUser.id, {
            openId: profile.openId,
            name: profile.name,
            email: profile.email,
            phone: profile.phone ?? existingUser.phone ?? null,
            address: profile.address ?? existingUser.address ?? null,
            loginMethod: "email",
            lastSignedIn: new Date(),
          });
        } else {
          try {
            await db.upsertUser({
              openId: profile.openId,
              name: profile.name,
              email: profile.email,
              phone: profile.phone ?? null,
              address: profile.address ?? null,
              loginMethod: "email",
              lastSignedIn: new Date(),
            });
            user = (await db.getUserByOpenId(profile.openId)) ?? (await db.getUserByEmail(profile.email));
          } catch (error) {
            console.warn("[Auth] Falling back to local session user:", error);
          }
        }

        if (!user) {
          throw new Error("فشل تسجيل الدخول المحلي: لم يتم حفظ المستخدم في قاعدة البيانات.");
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.email || "User",
          expiresInMs: ONE_YEAR_MS,
        });

        if (user.id > 0) {
          await db.updateUserById(user.id, { token: sessionToken });
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          user,
          sessionToken,
        };
      }),
    checkEmail: publicProcedure
      .input(z.string().email())
      .query(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.trim().toLowerCase());
        return {
          exists: Boolean(existingUser),
          name: existingUser?.name ?? null,
          phone: existingUser?.phone ?? null,
          address: existingUser?.address ?? null,
        };
      }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user) {
        await db.clearCart(ctx.user.id);
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(() => db.getProducts(12)),
    byId: publicProcedure.input(z.number()).query(({ input }) => db.getProductById(input)),
    byCategory: publicProcedure.input(z.string()).query(({ input }) => db.getProductsByCategory(input)),
    search: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minRating: z.number().optional(),
        categories: z.array(z.string()).optional(),
        brands: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        sizes: z.array(z.string()).optional(),
        limit: z.number().default(20),
      }))
      .query(({ input }) => db.searchProducts(input)),
    categories: publicProcedure.query(() => db.getCategories()),
    brands: publicProcedure.query(() => db.getBrands()),
    colors: publicProcedure.query(() => db.getProductColors()),
    sizes: publicProcedure.query(() => db.getProductSizes()),
  }),

  cart: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return db.getCartItems(ctx.user.id);
    }),
    add: publicProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().default(1) }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.addToCart(ctx.user.id, input.productId, input.quantity);
      }),
    remove: publicProcedure
      .input(z.number())
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.removeFromCart(ctx.user.id, input);
      }),
    updateQuantity: publicProcedure
      .input(z.object({ productId: z.number(), quantity: z.number() }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.updateCartItemQuantity(ctx.user.id, input.productId, input.quantity);
      }),
    clear: publicProcedure.mutation(({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return db.clearCart(ctx.user.id);
    }),
    checkout: publicProcedure
      .input(z.object({
        paymentMethod: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        const user = ctx.user;
        return db.createOrderFromCart(
          user.id,
          input.paymentMethod,
          user.name || null,
          user.phone || null,
          user.address || null
        );
      }),
    orders: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return db.getOrdersByUser(ctx.user.id);
    }),
    updateStatus: publicProcedure
      .input(z.object({ orderId: z.number(), status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.updateOrderStatus(ctx.user.id, input.orderId, input.status);
      }),
    updateItems: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
          paymentMethod: z.string().optional(),
          shippingAddress: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number().min(1),
              price: z.number().min(0),
              title: z.string().optional(),
              image: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.updateOrderItems(ctx.user.id, input.orderId, input.items, input.paymentMethod, input.shippingAddress ?? null);
      }),
  }),

  wishlist: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return db.getWishlistItems(ctx.user.id);
    }),
    add: publicProcedure
      .input(z.number())
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.addToWishlist(ctx.user.id, input);
      }),
    remove: publicProcedure
      .input(z.number())
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.removeFromWishlist(ctx.user.id, input);
      }),
    isInWishlist: publicProcedure
      .input(z.number())
      .query(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.isInWishlist(ctx.user.id, input);
      }),
  }),

  reviews: router({
    byProduct: publicProcedure.input(z.number()).query(({ input }) => db.getProductReviews(input)),
    byUser: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return db.getUserReviews(ctx.user.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          productId: z.number(),
          rating: z.number().min(1).max(5),
          title: z.string(),
          comment: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return db.createReview(ctx.user.id, input.productId, input.rating, input.title, input.comment);
      }),
    update: publicProcedure
      .input(
        z.object({
          reviewId: z.number(),
          rating: z.number().min(1).max(5),
          title: z.string(),
          comment: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.updateReview(input.reviewId, input.rating, input.title, input.comment)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteReview(input)),
    markHelpful: publicProcedure
      .input(z.number())
      .mutation(({ input }) => db.markReviewAsHelpful(input)),
  }),

  dashboard: router({
    stats: publicProcedure.query(() => db.getDashboardStats()),
    products: router({
      list: publicProcedure.query(() => db.getAllProducts()),
      create: publicProcedure
        .input(z.object({
          name: z.string(),
          brand: z.string(),
          category: z.string(),
          categoryId: z.number().optional(),
          brandId: z.number().optional(),
          description: z.string().optional(),
          price: z.string(),
          oldPrice: z.string().optional(),
          image: z.string().optional(),
          stock: z.number().default(0),
          isOnSale: z.boolean().optional(),
          badge: z.string().optional(),
          badgeColor: z.string().optional(),
          color: z.string().optional(),
          size: z.string().optional(),
        }))
        .mutation(({ input }) => db.createProductAdmin(input)),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          brand: z.string().optional(),
          price: z.string().optional(),
          oldPrice: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          categoryId: z.number().nullable().optional(),
          brandId: z.number().nullable().optional(),
          stock: z.number().optional(),
          isOnSale: z.boolean().optional(),
          image: z.string().optional(),
          badge: z.string().optional(),
          badgeColor: z.string().optional(),
          color: z.string().optional(),
          size: z.string().optional(),
        }))
        .mutation(({ input }) => db.updateProductAdmin(input.id, input)),
      delete: publicProcedure
        .input(z.number())
        .mutation(({ input }) => db.deleteProductAdmin(input)),
    }),
    categories: router({
      list: publicProcedure.query(() => db.getAllCategories()),
      create: publicProcedure
        .input(z.object({
          name: z.string(),
          slug: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(({ input }) => db.createCategoryAdmin(input)),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(({ input }) => db.updateCategoryAdmin(input.id, input)),
      delete: publicProcedure
        .input(z.number())
        .mutation(({ input }) => db.deleteCategoryAdmin(input)),
    }),
    brands: router({
      list: publicProcedure.query(() => db.getAllBrands()),
      create: publicProcedure
        .input(z.object({
          name: z.string(),
          slug: z.string().optional(),
          description: z.string().optional(),
          logo: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(({ input }) => db.createBrandAdmin(input)),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          logo: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(({ input }) => db.updateBrandAdmin(input.id, input)),
      delete: publicProcedure
        .input(z.number())
        .mutation(({ input }) => db.deleteBrandAdmin(input)),
    }),
    reviews: router({
      list: publicProcedure.query(() => db.getAllReviewsAdmin()),
      delete: publicProcedure
        .input(z.number())
        .mutation(({ input }) => db.deleteReviewAdmin(input)),
    }),
    users: router({
      list: publicProcedure.query(() => db.getAllUsersAdmin()),
      create: publicProcedure
        .input(z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          address: z.string().optional(),
          role: z.enum(["user", "admin"]).optional(),
        }))
        .mutation(({ input }) => db.createUserAdmin(input)),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          role: z.enum(["user", "admin"]).optional(),
        }))
        .mutation(({ input }) => {
          const { id, ...data } = input;
          return db.updateUserAdmin(id, data);
        }),
      delete: publicProcedure
        .input(z.number())
        .mutation(({ input }) => db.deleteUserAdmin(input)),
    }),
  }),
});

export type AppRouter = typeof appRouter;