import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";
import { z } from "zod";

const isoTs = z.string().datetime();

export async function createTask(req: Request, res: Response) {
  const body = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    due_date: z.string().date(),
    request_timestamp: isoTs
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Bad Request" });

  const t = await prisma.task.create({
    data: {
      title: body.data.title,
      content: body.data.content,
      due_date: new Date(body.data.due_date),
      last_request_timestamp: new Date(body.data.request_timestamp)
    }
  });
  return res.status(201).json(t);
}

export async function listTasks(_req: Request, res: Response) {
  const list = await prisma.task.findMany({ orderBy: { created_at: "desc" } });
  res.json(list);
}

export async function getTask(req: Request, res: Response) {
  const t = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!t) return res.status(404).json({ error: "Not Found" });
  res.json(t);
}

export async function updateTask(req: Request, res: Response) {
  const body = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    done: z.boolean().optional(),
    request_timestamp: isoTs
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Bad Request" });

  const id = req.params.id;
  const current = await prisma.task.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ error: "Not Found" });

  const incoming = new Date(body.data.request_timestamp);
  if (incoming < current.last_request_timestamp) {
    return res.status(409).json({ error: "Stale request_timestamp" });
  }

  const t = await prisma.task.update({
    where: { id },
    data: {
      ...(body.data.title !== undefined ? { title: body.data.title } : {}),
      ...(body.data.content !== undefined ? { content: body.data.content } : {}),
      ...(body.data.done !== undefined ? { done: body.data.done } : {}),
      last_request_timestamp: incoming
    }
  });
  res.json(t);
}

export async function deleteTask(req: Request, res: Response) {
  const body = z.object({ request_timestamp: isoTs }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Bad Request" });

  const id = req.params.id;
  const current = await prisma.task.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ error: "Not Found" });

  const incoming = new Date(body.data.request_timestamp);
  if (incoming < current.last_request_timestamp) {
    return res.status(409).json({ error: "Stale request_timestamp" });
  }

  await prisma.task.delete({ where: { id } });
  res.json({ ok: true });
}