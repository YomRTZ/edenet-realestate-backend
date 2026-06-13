// src/middleware/validate.js
// Generic zod validation middleware factory.
// Usage:
//   const { validate } = require('../middleware/validate');
//   const { loginSchema } = require('../validation/authSchemas');
//   router.post('/login', validate(loginSchema), authController.login);
//
// By default validates req.body.
// Pass a 'source' option to validate req.query or req.params instead:
//   validate(schema, { source: 'query' })
//   validate(schema, { source: 'params' })

const { ZodError } = require('zod');

/**
 * @param {import('zod').ZodTypeAny} schema
 * @param {{ source?: 'body' | 'query' | 'params' }} [options]
 */
function validate(schema, { source = 'body' } = {}) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Format zod errors into a flat, readable array
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join('.') || 'root',
        message: e.message,
      }));

      return res.status(400).json({
        error:  'Validation failed',
        errors,
      });
    }

    // Replace the raw input with the parsed (coerced + stripped) data
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
