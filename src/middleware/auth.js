import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { errorResponse } from "../utils/apiResponse.js";
export const authenticate = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer "))
    return errorResponse(res, {
      statusCode: 401,
      message: "Unauthorized access",
    });
  try {
    const token = h.split(" ")[1];
    const d = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: d.sub } });
    if (!user || user.status !== "ACTIVE")
      return errorResponse(res, {
        statusCode: 401,
        message: "User is not active",
      });
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch {
    return errorResponse(res, {
      statusCode: 401,
      message: "Invalid or expired token",
    });
  }
};
