import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { firestoreService } from "../services/firestoreService";
import { Role } from "../types/models";

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required. Access denied.",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: Role;
    };

    const user = await firestoreService.findAdminById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is invalid or deactivated. Access forbidden.",
      });
    }

    req.adminUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or unauthorized token. Access denied.",
    });
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires role [${allowedRoles.join(", ")}]. Current role: ${req.adminUser.role}.`,
      });
    }

    next();
  };
}


