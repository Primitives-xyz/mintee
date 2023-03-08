"use strict";
exports.__esModule = true;
exports.isWorker = void 0;
function isWorker() {
    return typeof window === "undefined";
}
exports.isWorker = isWorker;
