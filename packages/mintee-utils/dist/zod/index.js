"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.offChainMetadataSchema = exports.mintCompressBodySchema = exports.mintCompressOptionsSchema = exports.validateOffChainBody = exports.validateMintCompressBody = void 0;
var zod_1 = require("zod");
var types_1 = require("../types");
function validateMintCompressBody(json) {
    return __awaiter(this, void 0, void 0, function () {
        var body, options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!json.data) {
                        throw new Error("The body is null, try using our npm package instead: https://www.npmjs.com/package/mintee-nft");
                    }
                    if (!json.options) {
                        json.options = {};
                    }
                    body = exports.mintCompressBodySchema.safeParseAsync(json.data);
                    options = exports.mintCompressOptionsSchema.safeParseAsync(json.options);
                    return [4 /*yield*/, Promise.all([body, options])["catch"](function (e) {
                            console.log("Error parsing body", e);
                        })];
                case 1: 
                // const options = mintCompressOptionsSchema.parseAsync(json.options);
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.validateMintCompressBody = validateMintCompressBody;
function validateOffChainBody(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.offChainMetadataSchema.safeParseAsync(body)["catch"](function (e) {
                        console.log("Error parsing body", e);
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.validateOffChainBody = validateOffChainBody;
// combine zode schemas
exports.mintCompressOptionsSchema = zod_1.z
    .object({
    toWalletAddress: zod_1.z.string().max(200).optional(),
    network: zod_1.z.string().max(200).optional()
})
    .optional()
    .nullable();
//  parse json.data.name with Zod
exports.mintCompressBodySchema = zod_1.z.object({
    name: zod_1.z.string(),
    symbol: zod_1.z.string().max(10)["default"]("").optional(),
    description: zod_1.z.string().max(1000).optional(),
    uri: zod_1.z.string().max(200)["default"](""),
    sellerFeeBasisPoints: zod_1.z.number().min(0).max(10000)["default"](0),
    primarySaleHappened: zod_1.z.boolean()["default"](false),
    isMutable: zod_1.z.boolean()["default"](true),
    editionNonce: zod_1.z.number().optional(),
    tokenStandard: zod_1.z.nativeEnum(types_1.TokenStandard)["default"](0).optional(),
    collection: zod_1.z
        .object({
        verified: zod_1.z.boolean().optional(),
        key: zod_1.z.string().max(200).optional()
    })
        .optional(),
    uses: zod_1.z.nativeEnum(types_1.UseMethod).optional(),
    tokenProgramVersion: zod_1.z.nativeEnum(types_1.TokenProgramVersion)["default"](0).optional(),
    creators: zod_1.z
        .array(zod_1.z.object({
        address: zod_1.z.string().max(200),
        verified: zod_1.z.boolean().optional(),
        share: zod_1.z.number().min(0).max(100)
    }))
        .optional()
});
exports.offChainMetadataSchema = zod_1.z.object({
    name: zod_1.z.string(),
    symbol: zod_1.z.string().max(10)["default"]("").optional(),
    description: zod_1.z.string().max(1000).optional(),
    sellerFeeBasisPoints: zod_1.z.number().min(0).max(10000)["default"](0),
    image: zod_1.z.string().max(200).optional(),
    externalUrl: zod_1.z.string().max(200).optional(),
    attributes: zod_1.z
        .array(zod_1.z.object({
        trait_type: zod_1.z.string().optional(),
        value: zod_1.z.string().optional()
    }))
        .optional(),
    properties: zod_1.z
        .object({
        creators: zod_1.z
            .array(zod_1.z.object({
            address: zod_1.z.string().max(200),
            share: zod_1.z.number().min(0).max(100)
        }))
            .optional(),
        files: zod_1.z
            .array(zod_1.z.object({
            type: zod_1.z.string().optional(),
            uri: zod_1.z.string().max(200)
        }))
            .optional()
    })
        .optional(),
    collection: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        family: zod_1.z.string().optional()
    })
        .optional()
});
