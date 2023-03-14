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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var src_1 = require("../src");
var sinon_1 = __importDefault(require("sinon"));
(0, vitest_1.test)("Mintee initializes with apiKey and options", function () {
    var apiKey = "test-api-key";
    var network = "devnet";
    var options = { network: network };
    var mintee = new src_1.Mintee({ apiKey: apiKey, options: options });
    vitest_1.assert.equal(mintee.apiKey, apiKey);
    vitest_1.assert.equal(mintee.network, network);
});
(0, vitest_1.test)("Mintee initializes with apiKey only", function () {
    var apiKey = "test-api-key";
    var mintee = src_1.Mintee.make({ apiKey: apiKey });
    vitest_1.assert.equal(mintee.apiKey, apiKey);
    vitest_1.assert.equal(mintee.network, "devnet");
});
(0, vitest_1.test)("Mintee nftInfo method calls fetch with correct arguments", function () { return __awaiter(void 0, void 0, void 0, function () {
    var apiKey, tokenAddress, apiUrl, onChainResponse, fetchSpy, mintee, infoReponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                apiKey = "am9obm55d29vZHRrZUBnbWFpbC5jb206MTY3ODc2NDgwODQyNA==";
                tokenAddress = "2dVeNCGjQp4atVDW7ASLyaed4rzZ3wEKevFFQuh8Yn6C";
                apiUrl = "https://api.mintee.io//";
                onChainResponse = {
                    name: "testavatar",
                    symbol: "PRIM",
                    address: tokenAddress,
                    uri: "https://dw2h1frcjb7pw.cloudfront.net/6cf6bf512b7b0d5c.json",
                    editionNonce: 255,
                    tokenStandard: 0,
                };
                fetchSpy = sinon_1.default.spy(globalThis, "fetch");
                fetchSpy.withArgs("".concat(apiUrl, "nftInfo/").concat(tokenAddress), {
                    headers: {
                        Authorization: "Bearer ".concat(apiKey),
                    },
                });
                mintee = new src_1.Mintee({ apiKey: apiKey });
                return [4 /*yield*/, mintee.nftInfo({ tokenAddress: tokenAddress })];
            case 1:
                infoReponse = _a.sent();
                (0, vitest_1.expect)(infoReponse.token).toContain(onChainResponse);
                sinon_1.default.restore();
                return [2 /*return*/];
        }
    });
}); });
