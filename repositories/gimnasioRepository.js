import { pool } from '../database/connection.js';

export async function findAll(search) {
  let query = 'SELECT id, nombre, direccion, horarios, activo FROM gimnasios WHERE activo = TRUE';
  const params = [];

  if (search) {
    query += ' AND nombre LIKE ?';
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, nombre, direccion, horarios, activo FROM gimnasios WHERE id = ? AND activo = TRUE',
    [id]
  );
  return rows[0];
}

export async function create({ nombre, direccion, horarios }) {
  const [result] = await pool.query(
    'INSERT INTO gimnasios (nombre, direccion, horarios) VALUES (?, ?, ?)',
    [nombre, direccion, horarios]
  );
  return { id: result.insertId, nombre, direccion, horarios, activo: true };
}

export async function update(id, { nombre, direccion, horarios }) {
  await pool.query(
    'UPDATE gimnasios SET nombre = ?, direccion = ?, horarios = ? WHERE id = ?',
    [nombre, direccion, horarios, id]
  );
  return { id, nombre, direccion, horarios };
}

export async function logicalDelete(id) {
  await pool.query('UPDATE gimnasios SET activo = FALSE WHERE id = ?', [id]);
}
