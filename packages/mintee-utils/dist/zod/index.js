"use strict";
exports.__esModule = true;
exports.validateJWTInput = exports.validateMetadataBody = void 0;
var zod_1 = require("zod");
/**
 * Validate the body of the request using zod
 * @param body
 * @returns
 */
function validateMetadataBody(body) {
    var schema = zod_1.z.object({
        name: zod_1.z.string().min(1).max(32),
        description: zod_1.z.string().optional(),
        symbol: zod_1.z.string().max(10).optional(),
        max_uri_length: zod_1.z.number().max(100).optional()
    });
    var result = schema.safeParse(body);
    if (!result.success) {
        throw new Error("invalid body");
    }
    return result.data;
}
exports.validateMetadataBody = validateMetadataBody;
function validateJWTInput(body) {
    var schema = zod_1.z.object({
        name: zod_1.z.string().max(32),
        email: zod_1.z.string().email("wrong")
    });
    var result = schema.safeParse(body);
    if (!result.success) {
        throw new Error("invalid body");
    }
    return result.data;
}
exports.validateJWTInput = validateJWTInput;
