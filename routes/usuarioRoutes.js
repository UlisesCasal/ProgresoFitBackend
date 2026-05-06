import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Solo ADMIN puede crear entrenadores
router.post('/entrenador', authenticateToken, usuarioController.createEntrenador);

// Cualquiera puede registrarse como alumno
router.post('/alumno', usuarioController.createAlumno);

// Cualquier logueado puede ver un perfil
router.get('/:id', authenticateToken, usuarioController.getProfile);

export default router;
