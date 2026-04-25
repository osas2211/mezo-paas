"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
const config_1 = require("../lib/config");
exports.jwtConstants = {
    secret: config_1.env_config.jwt_secret,
};
//# sourceMappingURL=index.js.map