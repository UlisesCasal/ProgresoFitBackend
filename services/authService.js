import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection.js';

const SALT_ROUNDS = 10; //NUMERO DE RONDAS PARA ENCRIPTAR

export async function register(email, password, rol = "ALUMNO"){
    const [existing] = await pool.query('SELECT id FROM usuarios where email = ?', [email]);

    if(existing.length > 0){
        throw new Error('El correo ya está registrado');
    }

    //Encripto la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //Guardo en la base de datos
    const [result] = await pool.query('INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)', [email, hashedPassword, rol]);
    return { id: result.insertId, email, rol };
}

export async function login(email, password){
    const [users] = await pool.query('SELECT id, email, password, rol FROM usuarios WHERE email = ?', [email]);

    if (users.length === 0) {
        throw new Error('Credenciales inválidas');
    }

    const user = users[0];
    //Valido si la contraseña es valida
    const isValid = await bcrypt.compare(password, user.password);

    if(!isValid){
        throw new Error('Credenciales inválidas');
    }

    //Creo token JWT
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        rol: user.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
    );

    return {
        token, 
        user: {
            id: user.id,
            email: user.email,
            rol: user.rol,
        }
    };
}