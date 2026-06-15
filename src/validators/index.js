import { body } from "express-validator";



const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .isLength({min: 3})
            .withMessage("username must be in Lowercase & minimum length at least char 3"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
        body("fullName")
            .optional()
            .trim()

            
    ]
}

const userLoginValidator = () =>{
     return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("email is invalid"),
        body("password")
        .notEmpty()
        .withMessage("password is required")
     ]
}


const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
        .notEmpty()
        .withMessage("Old Password is required"),
        body("newPassword")
        .notEmpty()
        .withMessage("New Password is required")
    ]
}

const userForgotPasswordValidator = () =>{
    return [
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is Invalid")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
        .notEmpty()
        .withMessage("Password is required")
    ]
}

export{
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
}