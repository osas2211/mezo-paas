"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.8.0",
    "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider     = \"prisma-client\"\n  output       = \"../generated/prisma\"\n  moduleFormat = \"cjs\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel User {\n  id        String   @id @default(uuid())\n  name      String\n  email     String   @unique\n  password  String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  wallet    Wallet?\n}\n\nmodel Wallet {\n  id                String   @id @default(uuid())\n  encryptedPK       String\n  address           String   @unique\n  encryptedMnemonic String   @unique\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n  user              User     @relation(fields: [userId], references: [id])\n  userId            String   @unique\n  balance           String   @default(\"0\")\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"wallet\",\"kind\":\"object\",\"type\":\"Wallet\",\"relationName\":\"UserToWallet\"}],\"dbName\":null},\"Wallet\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"encryptedPK\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"address\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"encryptedMnemonic\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UserToWallet\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"balance\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"user\",\"wallet\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_count\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"Wallet.findUnique\",\"Wallet.findUniqueOrThrow\",\"Wallet.findFirst\",\"Wallet.findFirstOrThrow\",\"Wallet.findMany\",\"Wallet.createOne\",\"Wallet.createMany\",\"Wallet.createManyAndReturn\",\"Wallet.updateOne\",\"Wallet.updateMany\",\"Wallet.updateManyAndReturn\",\"Wallet.upsertOne\",\"Wallet.deleteOne\",\"Wallet.deleteMany\",\"Wallet.groupBy\",\"Wallet.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"encryptedPK\",\"address\",\"encryptedMnemonic\",\"createdAt\",\"updatedAt\",\"userId\",\"balance\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"name\",\"email\",\"password\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"disconnect\",\"delete\",\"connect\",\"set\"]"),
    graph: "WhEgCgIAAEIAICwAAEEAMC0AAAYAEC4AAEEAMC8BAAAAATNAAD4AITRAAD4AIUIBAD0AIUMBAAAAAUQBAD0AIQEAAAABACAMAQAAPwAgLAAAPAAwLQAAAwAQLgAAPAAwLwEAPQAhMAEAPQAhMQEAPQAhMgEAPQAhM0AAPgAhNEAAPgAhNQEAPQAhNgEAPQAhAQAAAAMAIAEAAAABACAKAgAAQgAgLAAAQQAwLQAABgAQLgAAQQAwLwEAPQAhM0AAPgAhNEAAPgAhQgEAPQAhQwEAPQAhRAEAPQAhAQIAAFUAIAMAAAAGACAFAAAHADAGAAABACADAAAABgAgBQAABwAwBgAAAQAgAwAAAAYAIAUAAAcAMAYAAAEAIAcCAABUACAvAQAAAAEzQAAAAAE0QAAAAAFCAQAAAAFDAQAAAAFEAQAAAAEBCgAACwAgBi8BAAAAATNAAAAAATRAAAAAAUIBAAAAAUMBAAAAAUQBAAAAAQEKAAANADABCgAADQAwBwIAAE4AIC8BAEYAITNAAEcAITRAAEcAIUIBAEYAIUMBAEYAIUQBAEYAIQIAAAABACAKAAAQACAGLwEARgAhM0AARwAhNEAARwAhQgEARgAhQwEARgAhRAEARgAhAgAAAAYAIAoAABIAIAIAAAAGACAKAAASACADAAAAAQAgEQAACwAgEgAAEAAgAQAAAAEAIAEAAAAGACADFwAASwAgGAAATQAgGQAATAAgCSwAAEAAMC0AABkAEC4AAEAAMC8BADUAITNAADYAITRAADYAIUIBADUAIUMBADUAIUQBADUAIQMAAAAGACAFAAAYADAWAAAZACADAAAABgAgBQAABwAwBgAAAQAgDAEAAD8AICwAADwAMC0AAAMAEC4AADwAMC8BAAAAATABAD0AITEBAAAAATIBAAAAATNAAD4AITRAAD4AITUBAAAAATYBAD0AIQEAAAAcACABAAAAHAAgAQEAAEoAIAMAAAADACAFAAAfADAGAAAcACADAAAAAwAgBQAAHwAwBgAAHAAgAwAAAAMAIAUAAB8AMAYAABwAIAkBAABJACAvAQAAAAEwAQAAAAExAQAAAAEyAQAAAAEzQAAAAAE0QAAAAAE1AQAAAAE2AQAAAAEBCgAAIwAgCC8BAAAAATABAAAAATEBAAAAATIBAAAAATNAAAAAATRAAAAAATUBAAAAATYBAAAAAQEKAAAlADABCgAAJQAwCQEAAEgAIC8BAEYAITABAEYAITEBAEYAITIBAEYAITNAAEcAITRAAEcAITUBAEYAITYBAEYAIQIAAAAcACAKAAAoACAILwEARgAhMAEARgAhMQEARgAhMgEARgAhM0AARwAhNEAARwAhNQEARgAhNgEARgAhAgAAAAMAIAoAACoAIAIAAAADACAKAAAqACADAAAAHAAgEQAAIwAgEgAAKAAgAQAAABwAIAEAAAADACADFwAAQwAgGAAARQAgGQAARAAgCywAADQAMC0AADEAEC4AADQAMC8BADUAITABADUAITEBADUAITIBADUAITNAADYAITRAADYAITUBADUAITYBADUAIQMAAAADACAFAAAwADAWAAAxACADAAAAAwAgBQAAHwAwBgAAHAAgCywAADQAMC0AADEAEC4AADQAMC8BADUAITABADUAITEBADUAITIBADUAITNAADYAITRAADYAITUBADUAITYBADUAIQ4XAAA4ACAYAAA7ACAZAAA7ACA3AQAAAAE4AQAAAAQ5AQAAAAQ6AQAAAAE7AQAAAAE8AQAAAAE9AQAAAAE-AQA6ACE_AQAAAAFAAQAAAAFBAQAAAAELFwAAOAAgGAAAOQAgGQAAOQAgN0AAAAABOEAAAAAEOUAAAAAEOkAAAAABO0AAAAABPEAAAAABPUAAAAABPkAANwAhCxcAADgAIBgAADkAIBkAADkAIDdAAAAAAThAAAAABDlAAAAABDpAAAAAATtAAAAAATxAAAAAAT1AAAAAAT5AADcAIQg3AgAAAAE4AgAAAAQ5AgAAAAQ6AgAAAAE7AgAAAAE8AgAAAAE9AgAAAAE-AgA4ACEIN0AAAAABOEAAAAAEOUAAAAAEOkAAAAABO0AAAAABPEAAAAABPUAAAAABPkAAOQAhDhcAADgAIBgAADsAIBkAADsAIDcBAAAAATgBAAAABDkBAAAABDoBAAAAATsBAAAAATwBAAAAAT0BAAAAAT4BADoAIT8BAAAAAUABAAAAAUEBAAAAAQs3AQAAAAE4AQAAAAQ5AQAAAAQ6AQAAAAE7AQAAAAE8AQAAAAE9AQAAAAE-AQA7ACE_AQAAAAFAAQAAAAFBAQAAAAEMAQAAPwAgLAAAPAAwLQAAAwAQLgAAPAAwLwEAPQAhMAEAPQAhMQEAPQAhMgEAPQAhM0AAPgAhNEAAPgAhNQEAPQAhNgEAPQAhCzcBAAAAATgBAAAABDkBAAAABDoBAAAAATsBAAAAATwBAAAAAT0BAAAAAT4BADsAIT8BAAAAAUABAAAAAUEBAAAAAQg3QAAAAAE4QAAAAAQ5QAAAAAQ6QAAAAAE7QAAAAAE8QAAAAAE9QAAAAAE-QAA5ACEMAgAAQgAgLAAAQQAwLQAABgAQLgAAQQAwLwEAPQAhM0AAPgAhNEAAPgAhQgEAPQAhQwEAPQAhRAEAPQAhRQAABgAgRgAABgAgCSwAAEAAMC0AABkAEC4AAEAAMC8BADUAITNAADYAITRAADYAIUIBADUAIUMBADUAIUQBADUAIQoCAABCACAsAABBADAtAAAGABAuAABBADAvAQA9ACEzQAA-ACE0QAA-ACFCAQA9ACFDAQA9ACFEAQA9ACEOAQAAPwAgLAAAPAAwLQAAAwAQLgAAPAAwLwEAPQAhMAEAPQAhMQEAPQAhMgEAPQAhM0AAPgAhNEAAPgAhNQEAPQAhNgEAPQAhRQAAAwAgRgAAAwAgAAAAAUwBAAAAAQFMQAAAAAEFEQAAVgAgEgAAWQAgRwAAVwAgSAAAWAAgSwAAAQAgAxEAAFYAIEcAAFcAIEsAAAEAIAECAABVACAAAAAHEQAATwAgEgAAUgAgRwAAUAAgSAAAUQAgSQAAAwAgSgAAAwAgSwAAHAAgBy8BAAAAATABAAAAATEBAAAAATIBAAAAATNAAAAAATRAAAAAATYBAAAAAQIAAAAcACARAABPACADAAAAAwAgEQAATwAgEgAAUwAgCQAAAAMAIAoAAFMAIC8BAEYAITABAEYAITEBAEYAITIBAEYAITNAAEcAITRAAEcAITYBAEYAIQcvAQBGACEwAQBGACExAQBGACEyAQBGACEzQABHACE0QABHACE2AQBGACEDEQAATwAgRwAAUAAgSwAAHAAgAQEAAEoAIAYvAQAAAAEzQAAAAAE0QAAAAAFCAQAAAAFDAQAAAAFEAQAAAAECAAAAAQAgEQAAVgAgAwAAAAYAIBEAAFYAIBIAAFoAIAgAAAAGACAKAABaACAvAQBGACEzQABHACE0QABHACFCAQBGACFDAQBGACFEAQBGACEGLwEARgAhM0AARwAhNEAARwAhQgEARgAhQwEARgAhRAEARgAhAQIEAgEBAAEAAAADFwAHGAAIGQAJAAAAAxcABxgACBkACQEBAAEBAQABAxcADhgADxkAEAAAAAMXAA4YAA8ZABADAgEEBQEHCAEICQEJCgELDAEMDgMNDwQOEQEPEwMQFAUTFQEUFgEVFwMaGgYbGwocHQIdHgIeIAIfIQIgIgIhJAIiJgMjJwskKQIlKwMmLAwnLQIoLgIpLwMqMg0rMxE"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.js"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map