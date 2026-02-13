import { Request, Response, NextFunction } from 'express';

export type Role =
  | 'super_admin'
  | 'admin'
  | 'team_member'
  | 'qa_lead'
  | 'inspector'
  | 'department_head';

type AuthUser = {
  id: string;
  role: Role;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: insufficient permissions',
        requiredRoles: roles,
      });
    }

    return next();
  };
};

export const authorizeTaskAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const elevatedRoles: Role[] = ['super_admin', 'admin', 'qa_lead', 'department_head'];
  if (elevatedRoles.includes(req.user.role)) return next();

  // For team_member / inspector, service layer will validate assignment ownership.
  return next();
};
