const UserService = require('../services/user.service')

const registerWorker = async(req, res, next) => {
    try {
        const data = req.body;
        const newWorker = await UserService.createUserWork(data);

        return res.status(201).json({
            success: true,
            message: 'Trabajador registrado exitosamente',
            trabajador: newWorker
        })
    } catch (error) {
        next(error)
    }
}

const getProfile = async(req, res, next) => {
    try {
        const email = req.params;

        if(!email){
            return res.status(400).json({message: 'Email requerido'})
        }

        const profile = await UserService.getUserProfile(email);

        if(!profile){
            // throw new NotFoundError()
            throw new Error('Usuario no encontrado')
        }

        return res.status(200).json(profile)
    } catch (error) {
        next(error)
    }
}

const updateProfile = async(req,res,next) => {
    try{
        const data = req.body;
        const update = await UserService.updateProfile(data);

        if(!update){
            // throw new NotFoundError()
            throw new Error('Usuario no encontrado para actualizacion')
        }

        return res.status(200).json({
            message: 'Perfil actualizado',
            perfil: update
        })
    } catch (error){
        next(error)
    }
}

const uploadJobPhoto = async (req, res, next) => {
    try {
        const uid = req.params;
        const job_image = req.body.photoUrl;

        if(!uid){
            const authError = new Error('Usuario no encontrado.');
             authError.status = 404;
             throw authError;
        }

        const newImagen = await UserService.uploadJobPhoto(uid, job_image);

        return res.status(201).json({
            message: 'Imagen subida correctamente',
            image: newImagen
        })
    } catch (error) {
        next(error)
    }
}

const deleteJobPhoto = async (req, res, next) => {
    try {
        const uid = req.params;
        const imageId = req.body.id;

        if(!uid){
            const authError = new Error('Usuario no encontrado.');
             authError.status = 404;
             throw authError;
        }

        await UserService.deleteJobPhoto(uid, imageId);

        return res.status(204).send();
    } catch (error) {
        next(error)
    }
}

const updateProfilePic = async(req, res, next) => {
    try {
        const uid = req.params;
        const newImage = req.body.ImageProfile;

        if(!uid){
            const authError = new Error('Usuario no encontrado.');
             authError.status = 404;
             throw authError;
        }

        const result = await UserService.updateProfilePic(uid, newImage);

        return res.status(200).json(result);
    } catch (error) {
        next(error)
    }
}

const updateProfileWorker = async (req, res, next) => {
    try {
        const uid = req.params;
        const data = req.body;

        if(!uid){
            const authError = new Error('Usuario no encontrado.');
             authError.status = 404;
             throw authError;
        }

        const result = await UserService.updateProfileWorker(uid, data);

        return res.status(200).json(result);
    } catch (error) {
        next(error)
    }
}

const getAllWorkers = async(req, res, next) => {
    try {
        const result = await UserService.getAllWorkers();
        return res.status(200).json(result);
    } catch (error) {
        next(error)
    }
}

const searchWorkers = async(req, res, next) => {
    try {
        const search = req.body.search;
        const id_job = req.body.id_job;

        const result = await UserService.searchWorkers(search, id_job);

        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

const getUserPhotos = async (req, res, next) => {
    try {
        const uid = req.params;

        const urls = await UserService.getUserPhotos();
        return res.status(200).json(urls);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerWorker,
    getProfile,
    getAllWorkers,
    getUserPhotos,
    updateProfile,
    updateProfilePic,
    updateProfileWorker,
    uploadJobPhoto,
    deleteJobPhoto,
    searchWorkers,
}