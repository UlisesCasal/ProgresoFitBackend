import { pool } from '../database/connection.js';

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0];
}

export async function findByEmail(email) {
  const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  return rows[0];
}

export async function create({ nombre, email, password, rol }) {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre || null, email, password, rol]
  );
  return { id: result.insertId, nombre: nombre || null, email, rol };
}
