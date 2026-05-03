import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/authRoutes.js';
import gimnasioRoutes from '../routes/gimnasioRoutes.js';

dotenv.config();

const app = express();

//Middlewares
app.use(cors()); //Permite la conexión desde el frontend
app.use(express.json()); // Parsea el body de las request a JSON

//Rutas por las que pasara mi App
app.use('/auth', authRoutes);
app.use('/gimnasios', gimnasioRoutes);

//Ruta de prueba 
app.get('/', (req, res) => {
  res.json({ message: 'API ProgresoFit funcionando'});
});


//Manejo de errores global:
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salio mal en el servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
})