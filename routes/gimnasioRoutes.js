//Las rutas protegidas usan authenticateToken y checkrole
import { Router } from 'express';
import * as gimnasioController from '../controllers/gimnasioController.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

//Cualquier logueado puede ver la lista y el detalle
router.get('/', authenticateToken, gimnasioController.getAll);
router.get('/:id', authenticateToken, gimnasioController.getById);

//Solo ADMIN puede crear, editar y borrar
router.post('/', authenticateToken, checkRole(['ADMIN']), gimnasioController.create);
router.put('/:id', authenticateToken, checkRole(['ADMIN']), gimnasioController.update);
router.delete('/:id', authenticateToken, checkRole(['ADMIN']), gimnasioController.remove);

export default router;
