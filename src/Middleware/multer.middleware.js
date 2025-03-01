import multer from 'multer';
import fs from 'fs';

export const MulterLocal = (destinationPath = 'general', allowedExtensions = []) => {
    // make sure that the folder exists
    const destinationFolder = `Assets/${destinationPath}`; 
    if(!fs.existsSync(destinationFolder)){
        fs.mkdirSync(destinationFolder, {recursive: true});
    }
    // disk storage
    const storage = multer.diskStorage({
        // destination 'required'
        destination: function (req, file, cb) {
            cb(null, destinationFolder)
        },
        // filename 'optional'
        filename: function (req, file, cb) {
            // console.log("file", file); //file before upload only pasrsed
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '__' + file.originalname)
        }        
    })
    // file filter
    const fileFilter = (req, file, cb) => {
        if (allowedExtensions.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
    const upload = multer({fileFilter, storage});
    return upload;
}

export const MulterHost = (allowedExtensions = []) => {
    // disk storage
    const storage = multer.diskStorage({})
    // file filter
    const fileFilter = (req, file, cb) => {
        if (allowedExtensions.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
    const upload = multer({fileFilter, storage});
    return upload;
}
