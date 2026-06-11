import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select("id, name, sku, price, cost, stock, reorder_level, image, sales_count, category_id, categories(name)")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.categories?.name ?? "Uncategorized",
      price: Number(p.price),
      cost: Number(p.cost),
      stock: p.stock,
      reorder: p.reorder_level,
      image: p.image,
      sales: p.sales_count,
    }));
  });

export const getCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("customers")
      .select("id, name, email, phone, tier, points, total_spent, orders_count, join_date")
      .order("total_spent", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      joinDate: new Date(c.join_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalSpent: Number(c.total_spent),
      orders: c.orders_count,
      points: c.points,
      tier: c.tier as "Bronze" | "Silver" | "Gold" | "Platinum",
    }));
  });

export const getRecentTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, order_number, items_count, total, payment_method, status, created_at, customers(name)")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []).map((o: any) => {
      const mins = Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000));
      const time = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hr ago` : `${Math.floor(mins / 1440)} d ago`;
      return {
        id: o.order_number,
        customer: o.customers?.name ?? "Walk-in",
        items: o.items_count,
        amount: Number(o.total),
        method: o.payment_method,
        status: o.status,
        time,
      };
    });
  });

export const getStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profiles, error } = await context.supabase
      .from("profiles")
      .select("id, email, full_name, avatar_initials, status, last_login");
    if (error) throw new Error(error.message);
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string>();
    (roles ?? []).forEach((r: any) => {
      const rank = { admin: 3, manager: 2, cashier: 1 } as Record<string, number>;
      const prev = roleMap.get(r.user_id);
      if (!prev || (rank[r.role] ?? 0) > (rank[prev] ?? 0)) roleMap.set(r.user_id, r.role);
    });
    return (profiles ?? []).map((p: any) => ({
      id: p.id,
      name: p.full_name || p.email,
      email: p.email,
      role: (roleMap.get(p.id) ?? "cashier").replace(/^./, (c) => c.toUpperCase()) as "Admin" | "Manager" | "Cashier",
      status: p.status,
      lastLogin: p.last_login ? new Date(p.last_login).toLocaleString() : "—",
      avatar: p.avatar_initials || p.email.slice(0, 2).toUpperCase(),
    }));
  });

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string(),
  unit_price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(1).max(120),
        email: z.string().email().max(200).optional().or(z.literal("")),
        phone: z.string().max(40).optional().or(z.literal("")),
        tier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]).default("Bronze"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("customers")
      .insert({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        tier: data.tier,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        customer_id: z.string().uuid().nullable().optional(),
        items: z.array(cartItemSchema).min(1),
        discount: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
        payment_method: z.enum(["Cash", "Card", "Transfer"]).default("Cash"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const subtotal = data.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const total = subtotal - data.discount + data.tax;
    const items_count = data.items.reduce((s, i) => s + i.quantity, 0);
    const { data: order, error } = await context.supabase
      .from("orders")
      .insert({
        customer_id: data.customer_id ?? null,
        cashier_id: context.userId,
        subtotal,
        discount: data.discount,
        tax: data.tax,
        total,
        items_count,
        payment_method: data.payment_method,
        status: "completed",
      })
      .select("id, order_number")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Failed to create order");
    const { error: itemErr } = await context.supabase.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.name,
        unit_price: i.unit_price,
        quantity: i.quantity,
        line_total: i.unit_price * i.quantity,
      })),
    );
    if (itemErr) throw new Error(itemErr.message);
    return { id: order.id, order_number: order.order_number, total };
  });