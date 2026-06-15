const { body } = require('express-validator');

const createUrlValidator = [
  body('originalUrl').isURL({ require_protocol: true }).withMessage('Valid URL with protocol required'),
  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .isAlphanumeric()
    .withMessage('Custom alias must be alphanumeric')
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be 3–30 characters'),
  body('expiryDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO date'),
];

const updateUrlValidator = [
  body('originalUrl')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Valid URL with protocol required'),
  body('status')
    .optional()
    .isIn(['active', 'disabled'])
    .withMessage('Status must be active or disabled'),
  body('expiryDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO date'),
];

module.exports = { createUrlValidator, updateUrlValidator };
