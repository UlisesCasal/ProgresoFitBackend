import bcrypt from 'bcrypt';
import * as usuarioRepository from '../repositories/usuarioRepository.js';

const SALT_ROUNDS = 10;

export async function createEntrenador(adminUser, { nombre, email, password }) {
  if (adminUser.rol !== 'ADMIN') {
    throw new Error('Solo un ADMIN puede crear entrenadores');
  }
  if (!email || !password) throw new Error('Email y password son obligatorios');

  const existing = await usuarioRepository.findByEmail(email);
  if (existing) throw new Error('El correo ya está registrado');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return await usuarioRepository.create({ nombre, email, password: hashed, rol: 'ENTRENADOR' });
}

export async function createAlumno({ nombre, email, password }) {
  if (!email || !password) throw new Error('Email y password son obligatorios');

  const existing = await usuarioRepository.findByEmail(email);
  if (existing) throw new Error('El correo ya está registrado');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return await usuarioRepository.create({ nombre, email, password: hashed, rol: 'ALUMNO' });
}

export async function getProfile(id) {
  const user = await usuarioRepository.findById(id);
  if (!user) throw new Error('Usuario no encontrado');
  return user;
}
