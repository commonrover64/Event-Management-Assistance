import { createCrudRouter } from '../../lib/crud-router';
import * as guestsController from './guests.controller';

export const guestsRouter = createCrudRouter(guestsController, 'segmentId');
