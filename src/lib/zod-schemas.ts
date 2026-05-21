import { z } from 'zod';

export const profileCreateSchema = z.object({
  businessName: z.string().min(1, "businessName es requerido"),
  city: z.string().min(1, "city es requerido"),
  services: z.string().min(1, "services es requerido"),
  trustReason: z.string().min(1, "trustReason es requerido"),
  contactPhone: z.string().min(1, "contactPhone es requerido"),
  username: z.string().optional(),
  vibe: z.string().default('modern'),
  legalAcceptedAt: z.string().datetime({ message: "legalAcceptedAt debe ser un string ISO 8601 válido y es OBLIGATORIO" })
});

export const portfolioCreateSchema = z.object({
  businessId: z.string().optional(),
  fullName: z.string().min(1, "fullName es requerido"),
  title: z.string().optional(),
  profession: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email("email inválido y requerido"),
  phone: z.string().min(1, "phone es requerido"),
  website: z.string().optional().nullable(),
  socialLinks: z.any().optional(),
  skills: z.any().optional(),
  experience: z.any().optional(),
  projects: z.any().optional(),
  content: z.any().optional(),
  template: z.string().optional(),
  legalAcceptedAt: z.string().datetime({ message: "legalAcceptedAt debe ser un string ISO 8601 válido y es OBLIGATORIO" })
});
