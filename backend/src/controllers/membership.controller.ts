import type { Request, Response } from "express";
import { z } from "zod";

import {
  findCustomerMembershipSnapshot,
  searchCustomers,
} from "../services/customer.service";
import {
  createMembershipPlan,
  deleteMembershipPlan,
  listMembershipPlans,
  purchaseMembership,
  updateMembershipPlan,
} from "../services/membership.service";

const purchaseSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(20),
  planId: z.string().min(1),
});

const planSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  maxHours: z.number().positive(),
  durationDays: z.number().int().positive(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  maxHours: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function listPlans(_req: Request, res: Response): Promise<void> {
  const plans = await listMembershipPlans();
  res.json(plans);
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const query =
    typeof req.query["query"] === "string" ? req.query["query"] : undefined;
  const customers = await searchCustomers(query);
  res.json(customers);
}

export async function lookupMember(req: Request, res: Response): Promise<void> {
  const customer = await findCustomerMembershipSnapshot(
    String(req.params["phone"]),
  );
  if (!customer) {
    res.status(404).json({ error: { message: "Customer not found" } });
    return;
  }
  res.json(customer);
}

export async function createMembership(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new Error("Unauthorized");
  const data = purchaseSchema.parse(req.body);
  const membership = await purchaseMembership({
    ...data,
    staffId: req.user.userId,
  });
  res.status(201).json(membership);
}

export async function createPlan(req: Request, res: Response): Promise<void> {
  const data = planSchema.parse(req.body);
  const plan = await createMembershipPlan({
    name: data.name,
    price: data.price,
    maxMinutes: Math.round(data.maxHours * 60),
    durationDays: data.durationDays,
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
  });
  res.status(201).json(plan);
}

export async function editPlan(req: Request, res: Response): Promise<void> {
  const data = updatePlanSchema.parse(req.body);
  const plan = await updateMembershipPlan(String(req.params["id"]), {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.price !== undefined ? { price: data.price } : {}),
    ...(data.maxHours !== undefined
      ? { maxMinutes: Math.round(data.maxHours * 60) }
      : {}),
    ...(data.durationDays !== undefined
      ? { durationDays: data.durationDays }
      : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
  });
  res.json(plan);
}

export async function removePlan(req: Request, res: Response): Promise<void> {
  await deleteMembershipPlan(String(req.params["id"]));
  res.status(204).send();
}
