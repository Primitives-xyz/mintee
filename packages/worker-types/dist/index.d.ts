import { R2Bucket, KVNamespace } from "@cloudflare/workers-types";
export type Env = {
    rpcUrl: string;
    r2Url: string;
    factoryUrl: string;
    bucket: R2Bucket;
    nftInfo: KVNamespace;
    apiTokens: KVNamespace;
};
export declare function isWorker(): boolean;
//# sourceMappingURL=index.d.ts.map