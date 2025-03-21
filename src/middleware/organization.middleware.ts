import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Estendendo a interface Request do Express para incluir 'user'
interface RequestWithUser extends Request {
  user?: any;
  organizationId?: string;
}

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    // Verifica se existe usuário autenticado na requisição (adicionado pelo JWT guard)
    if (req.user) {
      // Adiciona organizationId à requisição, se existir no usuário
      if (req.user['organizationId']) {
        req.organizationId = req.user['organizationId'];
      }
    }
    
    next();
  }
} 