const Joi = require('joi');
const AppError = require('./AppError');
const axios = require('axios');

const signupSchema = Joi.object({
    fullname: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .required()
        .email({ minDomainSegments: 2 }),

    password: Joi.string()
        .min(8)
        .max(16)
        .required()
        .pattern(new RegExp(/^((.*\d))([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff]*)$/)),

    password_repeat: Joi.ref('password'),
})



const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email({ minDomainSegments: 2 }),

    password: Joi.string()
        .min(8)
        .max(16)
        .required()
        .pattern(new RegExp(/^((.*\d))([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff]*)$/)),

})

const loginValidation = (req, res, next) => {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.message, 400, error.details));
    next();
}
const signupValidation = async (req, res, next) => {
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.message, 400, error.details));

    const hasEnglishWords = await containsEnglishWords(req.body.password);

    if (hasEnglishWords) {
        return next(new AppError("Password contains English words.", 400, [{ path: ["password"], message: "Password contains English words.", type: "string.password" }]));

    } else {
        next();
    }


}

async function containsEnglishWords(password) {
    // Split password into non-numeric parts    
    const words = password.split(/\d+/);
    const responsePromises = words.map(word => checkWord(word));
    const responses = await Promise.all(responsePromises);

    // If any word is found in the dictionary, return true
    return responses.some(response => response.found);
}


async function checkWord(word) {
    try {
        const response = await axios.get(`${process.env.DICTIONARYAPI_BASEURL}${word}`);
        const data = response.data;

        // console.log(word, data[0].phonetics)
        if (JSON.stringify(data[0].phonetics) == "[]") {
            console.error(`Error checking word "${word}":`, error.message);
            return { word, found: false };
        }
        else {
            return { word, found: data.length > 0 };
        }


    } catch (error) {
        console.error(`Error checking word "${word}":`, error.message);
        return { word, found: false };
    }
}

module.exports = { loginValidation, signupValidation }