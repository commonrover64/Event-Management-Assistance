import { createCrudRouter } from '../../lib/crud-router';
import * as tasksController from './tasks.controller';

export const tasksRouter = createCrudRouter(tasksController, 'taskId');
