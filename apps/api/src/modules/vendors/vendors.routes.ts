import { createCrudRouter } from '../../lib/crud-router';
import * as vendorsController from './vendors.controller';

export const vendorsRouter = createCrudRouter(vendorsController, 'vendorId');
