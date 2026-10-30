import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  fields?: Record<string, string>;

  constructor(
    statusCode: number,
    message: string,
    code: string = "API_ERROR",
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const reqId =
    (req as any).id || (req.headers["x-request-id"] as string) || "req_internal";

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    const errorsList = err.errors.map((e) => {
      const fieldName = e.path.join(".") || "form";
      if (!fields[fieldName]) {
        fields[fieldName] = e.message;
      }
      return {
        field: fieldName,
        message: e.message,
      };
    });

    console.warn(`[Validation Error ${reqId}] ${req.method} ${req.url}:`, fields);

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fields,
      },
      message: "Validation failed. Please correct the highlighted fields.",
      errors: errorsList,
      requestId: reqId,
    });
  }

  // 2. Prisma Relational & Constraint Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation (e.g. slug or email)
    if (err.code === "P2002") {
      const targetFields = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(", ")
        : String(err.meta?.target || "field");

      const fields: Record<string, string> = {};
      if (Array.isArray(err.meta?.target)) {
        for (const t of err.meta.target as string[]) {
          fields[t] = `A record with this ${t} already exists. Please choose a unique value.`;
        }
      } else {
        fields[targetFields] = `A record with this ${targetFields} already exists. Please choose a unique value.`;
      }

      console.warn(`[Conflict ${reqId}] Unique constraint violated on ${targetFields}`);

      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: `A record with this ${targetFields} already exists. Please choose a unique value.`,
          fields,
        },
        message: `A record with this ${targetFields} already exists.`,
        requestId: reqId,
      });
    }

    // P2003: Foreign key constraint violation (e.g. invalid categoryId)
    if (err.code === "P2003") {
      const fieldName = String(err.meta?.field_name || "relation");
      console.warn(`[Foreign Key Error ${reqId}] Foreign key constraint violated on ${fieldName}`);

      return res.status(400).json({
        success: false,
        error: {
          code: "FOREIGN_KEY_ERROR",
          message: "The referenced relationship does not exist in the database.",
          fields: {
            [fieldName]: "Referenced record does not exist.",
          },
        },
        message: "Referenced relationship does not exist in the database.",
        requestId: reqId,
      });
    }

    // P2025: Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: (err.meta?.cause as string) || "Record not found.",
          fields: {},
        },
        message: (err.meta?.cause as string) || "Record not found.",
        requestId: reqId,
      });
    }
  }

  // 3. Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        fields: err.fields || {},
      },
      message: err.message,
      requestId: reqId,
    });
  }

  // 4. Unexpected / Server Internal Error
  console.error(`[API Error ${reqId}] ${req.method} ${req.url}:`, err?.message || String(err));
  if (err?.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        statusCode === 500
          ? "An unexpected server error occurred. Please try again later."
          : err.message || "An error occurred.",
      fields: {},
    },
    message: err.message || "An unexpected server error occurred",
    requestId: reqId,
  });
}
