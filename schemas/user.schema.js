'use strict';

const Joi = require('joi');

const loginSchema = Joi.object({
    UserName: Joi.string().required().messages({
        'string.base': `"UserName" should be a type of 'text'`,
        'string.empty': `"UserName" cannot be an empty field`,
        'any.required': `"UserName" is a required field`
    }),
  Password: Joi.string()
    .min(6)
    .required()
    .messages({
      'any.required': 'password is required',
      'string.min': 'password must have at least 6 characters',
    }),
});

module.exports = { loginSchema };