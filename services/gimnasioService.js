import * as gimnasioRepository from '../repositories/gimnasioRepository.js';

export async function getAllGimnasios(user, search){
    //Cualquier usuario logueado puede listar 
    return await gimnasioRepository.findAll(search);
}

export async function getGimnasioById(user, id){
    const gimnasio = await gimnasioRepository.findById(id);
    if (!gimnasio) throw new Error('Gimnasio no encontrado');
    return gimnasio;
}

export async function createGimnasio(user, data){
    //Solo un admin puede crear gimnasios
    if ( user.rol !== 'ADMIN' ){
        throw new Error('No tenes permiso para crear gimnasios');
    }
    return await gimnasioRepository.create(data);
}

export async function updateGimnasio(user, id, data){
    //Solo un admin puede actualizar gimnasios
    if ( user.rol !== 'ADMIN' ){
        throw new Error('No tenes permiso para editar gimnasios');
    }
    await gimnasioRepository.update(id, data);
}

export async function deleteGimnasio(user, id){
    if( user.rol !== 'ADMIN'){
        throw new Error('No tenes permiso para eliminar gimnasios');
    }
    await gimnasioRepository.logicalDelete(id);
}