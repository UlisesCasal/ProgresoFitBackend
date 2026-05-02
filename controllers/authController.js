import * as authService from '../services/authService.js';

export async function registerController(req, res){
    try{
        const { email, password, rol } = req.body;
        
        //Validacion basica
        if (!email || !password){
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        const user = await authService.register(email, password, rol);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user
        });
    } catch (error){
        res.status(400).json({ error: error.message });
    }
}

export async function loginController(req, res){
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        const result = await authService.login(email, password);

        res.json(result);
    } catch(error){
        res.status(401).json({ error: error.message });
    }
}

export async function logoutController(req, res) {
    res.json({ message: 'Logout exitoso. Eliminá el token del cliente'});
}
