import { Router } from 'express';
import type { RequestHandler } from 'express';

export interface CrudController {
  list: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
}

// Standard collection routes: GET /, POST /, PATCH /:id, DELETE /:id
export function createCrudRouter(controller: CrudController, idParam: string): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch(`/:${idParam}`, controller.update);
  router.delete(`/:${idParam}`, controller.remove);
  return router;
}
