import express from 'express';
import geoController from '../controllers/geo.controller';

const geoRouter = express.Router();

geoRouter.get('/geo', geoController.getGeo);

export default geoRouter;