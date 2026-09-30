import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { activityRouter } from '../activity/activity.routes';
import { requireEventAccess } from './event-access';
import * as eventsController from './events.controller';
import { guestsRouter } from '../guests/guests.routes';
import { tasksRouter } from '../tasks/tasks.routes';
import { vendorsRouter } from '../vendors/vendors.routes';

// Everything below /events/:eventId, reached only after ownership is verified
const eventScoped = Router();
eventScoped.get('/', eventsController.get);
eventScoped.patch('/', eventsController.update);
eventScoped.delete('/', eventsController.remove);
eventScoped.post('/sub-events', eventsController.addSubEvent);
eventScoped.patch('/sub-events/:subEventId', eventsController.updateSubEvent);
eventScoped.delete('/sub-events/:subEventId', eventsController.removeSubEvent);
eventScoped.use('/activity', activityRouter);

export const eventsRouter = Router();
eventsRouter.use(requireAuth);
eventsRouter.get('/', eventsController.list);
eventsRouter.post('/', eventsController.create);
eventsRouter.use('/:eventId', requireEventAccess, eventScoped);
eventScoped.use('/tasks', tasksRouter);
eventScoped.use('/vendors', vendorsRouter);
eventScoped.use('/guest-segments', guestsRouter);
eventScoped.use('/activity', activityRouter);
