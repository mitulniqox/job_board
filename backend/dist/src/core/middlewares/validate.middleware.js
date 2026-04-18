"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => (req, _res, next) => {
    schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    next();
};
exports.validateRequest = validateRequest;
