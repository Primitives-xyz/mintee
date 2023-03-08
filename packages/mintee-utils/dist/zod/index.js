"use strict";
exports.__esModule = true;
exports.validateSolanaAddress = exports.validateJWTInput = exports.validateMetadataBody = void 0;
var zod_1 = require("zod");
var web3_js_1 = require("@solana/web3.js");
/**
 * Validate the body of the request using zod
 * @param body
 * @returns
 */
function validateMetadataBody(body) {
    var schema = zod_1.z.object({
        name: zod_1.z.string().max(32),
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
function validateSolanaAddress(string) {
    // check if address is Solana public key
    var address = zod_1.z.string().refine(function (address) {
        try {
            new web3_js_1.PublicKey(address);
            return true;
        }
        catch (e) {
            return false;
        }
    }, "Invalid Solana address");
    var result = address.safeParse(string);
    if (!result.success) {
        return false;
    }
    return new web3_js_1.PublicKey(result);
}
exports.validateSolanaAddress = validateSolanaAddress;
