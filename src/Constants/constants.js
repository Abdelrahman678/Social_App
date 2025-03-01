export const systemRoles = {
    ADMIN:"admin",
    USER:"user",
    SUPERADMIN:"superadmin"
}

export const genderEnum = {
    MALE:"male",
    FEMALE:"female",
    NOT_SPECIFIED:"not_specified"
}

export const providerEnum = {
    GOOGLE:"google",
    FACEBOOK:"facebook",
    SYSTEM:"system"
}

const {ADMIN, USER, SUPERADMIN} = systemRoles
export const ADMIN_USER = [ADMIN, USER]
export const ADMIN_SUPERADMIN = [ADMIN, SUPERADMIN]
export const USER_SUPERADMIN = [USER, SUPERADMIN]

// Extensions Allowed
export const imageExtensions = ["image/jpeg", "image/png", "image/jpg"]
export const videoExtensions = ["video/mp4", "video/avi", "video/mov"]
export const documentExtensions = ["application/pdf", "application/json", "application/javascript"]

export const commentOnModelEnum = {
    POST:"Post",
    COMMENT:"Comment"
}

export const reactTypeEnum = {
    LIKE:"like",
    WOW:"wow",
    LOVE:"love",
    HAHA:"haha",
    SAD:"sad",
    ANGRY:"angry"
}