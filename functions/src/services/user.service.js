const admin = require('../../config/firebase');

const db = admin.database();

function getNextId(array){
    if(array.length === 0) return 1;

    const ids = array.map(a => a.id);
    return Math.max(...ids) + 1;
}

class UserService{
    // crear trabajador
    async createUserWork(data){
        const existingUser = await admin
            .auth()
            .getUserByEmail(data.email)
            .catch(() => null);

        if(existingUser){
            throw new Error('El email ya se encuentra registrado.');
        }

        let phoneNumber = data.phoneNumber;

        if(data.phoneNumber){
            phoneNumber = `+54${data.phoneNumber}`;
        }

        const workerRecord = await admin.auth().createUser({
            displayName: data.name,
            email: data.email,
            password: data.password,
            phoneNumber: phoneNumber
        })

        const newWorker = {
            uid: workerRecord.uid,
            email: data.email,
            //password: data.password,
            phoneNumber: data.phoneNumber,
            userDescription: data.userDescription,
            imageProfile: data.imageProfile,
            dni: data.dni,
            location: data.location,
            is_worker: true,
            id_job: data.id_job,
            job_description: data.job_description,
            job_images: data.job_images,
            created_at: new Date().toISOString(),
        }

        // guardar en realtime database

        await db.ref(`users/${workerRecord.uid}`).set(newWorker);

        return newWorker;
    }

    async getUserProfile(email){
        if(!email){
            throw new Error('El email es requerido.');
        }

        let resultUser;
        try {
            resultUser = await admin.auth().getUserByEmail(email);
        } catch (error) {
            if(error.code === 'auth/user-not-found'){
                //throw new NotFoundError();
                return null;
            }
            //throw new BaseError();
            throw error;
        }

        const profile = await db.ref(`users/${resultUser.uid}`).get();

        if(profile.exists()){
            const data = profile.val();

            return {
                ...data
            }
        } else {
            return {
                uid: resultUser.uid,
                email: resultUser.email,
                message: 'Perfil no encontrado'
            }
        }


    }

    async updateProfile(data){

        if(!data.email){
            throw new Error('El email es requerido')
        }

        let resultUser;
        try {
            resultUser = await admin.auth().getUserByEmail(data.email);
        } catch (error) {
            if(error.code === 'auth/user-not-found'){
                //throw new NotFoundError();
                return null;
            }
            //throw new BaseError();
            throw error;
        }
        // VALIDAR SCHEMA

        const profile = await db.ref(`users/${resultUser.uid}`).update({
            dni: data.dni,
            userDescription: data.userDescription,
            imageProfile: data.imageProfile,
            location: data.location
        })

        const profileSnapshot = await db.ref(`users/${resultUser.uid}`).get();
        return profileSnapshot.exists() ? profileSnapshot.val() : null;

    }

    async uploadJobPhoto(uid, photoUrl){
        if(!uid){
            throw new Error('UID no ingresado');
        } 
        if(typeof photoUrl !== 'string' || photoUrl.length === 0){
            throw new Error("URL de imagen invalido")
        }

        const user = db.ref(`users/${uid}/job_images`);

        const { committed, snapshot } = await user.transaction(currentData => {

            let actualImages = currentData ?? [];

            if(typeof actualImages === 'string'){
                try {
                    actualImages = JSON.parse(actualImages)
                } catch (error) {
                    actualImages = [];
                }
            }

            actualImages = Array.isArray(actualImages) ? actualImages : [];

            const nextId = getNextId(actualImages)

            const newImage = {
                id: nextId,
                url: photoUrl
            };

            actualImages.push(newImage);

            return actualImages
        })

        if(!committed){
            // throw new BaseError()
            throw new Error('La actualizacion de imagen falló')
        }

        const newImagesArray = snapshot.val();
        const ultimaImagen = newImagesArray[newImagesArray.length - 1];

        return ultimaImagen;
    }

    async deleteJobPhoto(uid, imageId){
        if(!uid){
            throw new Error("ID requerido");
        }

        const id = parseInt(imageId);
        if(isNaN(id)){
            throw new Error('ID de imagen invalido');
        }

        const user = db.ref(`users/${uid}/job_images`);

        const { committed, snapshot } = await user.transaction(currentData => {
            let imagenes = currentData ?? [];
            if(typeof imagenes === 'string'){
                try {
                    imagenes = JSON.parse(imagenes);
                } catch (error) {
                    imagenes = [];
                }
            }

            imagenes = Array.isArray(imagenes) ? imagenes : [];

            const initialLength = imagenes.length;

            const imgFiltradas = imagenes.filter(i => {
                return i.id !== id;
            });

            return imgFiltradas;
        });

        if(!committed){
            throw new Error('La transanccion fallo');
        }

        return {message: `Imagen con id ${id} eliminada correctamente.`}
    }

    async updateProfilePic(uid, newImage){
        if(!uid){
            throw new Error('ID requerido')
        }

        if(typeof newImage !== 'string' || newImage.length === 0){
            //throw new NotFoundError();
            throw new Error('Imagen invalida')
        }

        await db.ref(`users/${uid}`).update({
            imageProfile: newImage
        });

        return {
            message: 'Imagen actualizada correctamente',
            user: {
                id: uid,
                imageProfile: newImage
            }
        }
    }

    async updateProfileWorker(uid, data){

        const updateProfile = {
            dni: data.dni,
            userDescription: data.userDescription,
            imageProfile: data.imageProfile,
            location: data.location,
            is_worker: data.is_worker,
            job_description: data.job_description,
            job_images: data.job_images,
            id_job: data.id_job
        }

        // VALIDAR ESQUEMA 

        await db.ref(`users/${uid}`).update(updateProfile);

        const profile = await db.ref(`users/${uid}`).get();

        const profileUpdate = profile.val()

        return {
            message: 'Perfil actualizado correctamente',
            user: {
                id: uid,
                dni: profileUpdate.dni,
                is_worker: profileUpdate.is_worker
            }
        }

    }

    async getAllWorkers(){

        const userRef = db.ref('users');

        const results = await userRef.orderByChild('is_worker').equalTo(true).get();

        let trabajadores = [];

        if (results.exists()){
            const userObject = results.val();

            trabajadores = Object.values(userObject);
        }

        return {
            success: true,
            trabajadores: trabajadores,
        }

    }

    async searchWorkers(search, id_job){
        
        const snapshot = await db.ref('users').orderByChild('is_worker').equalTo(true).get();

        if(!snapshot.exists()){
            return {
                success: true,
                trabajadores: [],
            }
        }

        let trabajadores = Object.values(snapshot.val());

        if(id_job){
            const jobId = parseInt(id_job);
            trabajadores = trabajadores.filter(t => t.id_job === jobId);
        }

        if(search){
            const searchLower = search.toLowerCase();
            trabajadores = trabajadores.filter(t => t.name && t.name.toLowerCase().includes(searchLower));
        }

        return {
            success: true,
            workers: trabajadores
        }

    }

    async getUserPhotos(uid){
        const snapshot = await db.ref(`users/${uid}`).get();
        
        if(!snapshot.exists()){
            // throw new NotFoundError();
            const error = new Error('Usuario no encontrado');
            error.status = 404;
            throw error;
        }

        const userData = snapshot.val();

        let imagenes = userData.job_images ?? [];

        if(typeof imagenes === 'string'){
            try{
                imagenes = JSON.parse(imagenes);
            } catch (error){
                imagenes = [];
            }
        }

        imagenes = Array.isArray(imagenes) ? imagenes : [];

        const imgURLS = imagenes.map(i => i.url);

        return imgURLS;
    }
}

module.exports = new UserService();
