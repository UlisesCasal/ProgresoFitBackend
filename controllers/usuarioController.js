import * as usuarioService from '../services/usuarioService.js';

export async function createEntrenador(req, res) {
  try {
    const { nombre, email, password } = req.body;
    const user = await usuarioService.createEntrenador(req.user, { nombre, email, password });
    res.status(201).json({ message: 'Entrenador creado exitosamente', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function createAlumno(req, res) {
  try {
    const { nombre, email, password } = req.body;
    const user = await usuarioService.createAlumno({ nombre, email, password });
    res.status(201).json({ message: 'Alumno registrado exitosamente', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await usuarioService.getProfile(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
