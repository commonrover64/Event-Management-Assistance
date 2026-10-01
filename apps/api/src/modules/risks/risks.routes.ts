import { Router } from 'express';
import * as risksController from './risks.controller';

export const risksRouter = Router();

risksRouter.get('/', risksController.list);
risksRouter.patch('/:riskId', risksController.update);
