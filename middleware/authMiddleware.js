import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next){
    //El header viene asi: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //Sacamos el "Bearer"

    if (!token){
        return res.status(401).json({error: 'Token no proporcionado'});
    }

    try{
        //Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Guardo los datos del usuario para usarlo en los controllers
        req.user = decoded;
        next(); //Continua con el siguiente middleware controller
    } catch (error){
        return res.status(403).json({ error: 'Token inválido o expirado'});
    }
}

export function checkRole(allowedRoles){
    return (req, res, next) => {
        if (!req.user){
            return res.status(401).json({ error: 'Usuario no autenticado'});
        }

        if (!allowedRoles.includes(req.user.rol)){
            return res.status(403).json({ error: 'No tenes permiso para acceder a este recurso'});
        }
        next(); //Continua con el siguiente middleware controller
    };
}
