import { z } from "zod";
import { TokenProgramVersion, TokenStandard, UseMethod } from "../types";
export declare function validateMintCompressBody(json: any): Promise<[{
    symbol: string;
    name: string;
    uri: string;
    creators: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[];
    sellerFeeBasisPoints: number;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number | null;
    tokenStandard: TokenStandard;
    uses: UseMethod | null;
    tokenProgramVersion: TokenProgramVersion;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
}, {
    toWalletAddress?: string | undefined;
    network?: string | undefined;
}]>;
export declare const mintCompressOptionsSchema: z.ZodObject<{
    toWalletAddress: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    toWalletAddress?: string | undefined;
    network?: string | undefined;
}, {
    toWalletAddress?: string | undefined;
    network?: string | undefined;
}>;
export declare const mintCompressBodySchema: z.ZodObject<{
    name: z.ZodString;
    symbol: z.ZodDefault<z.ZodString>;
    uri: z.ZodDefault<z.ZodString>;
    sellerFeeBasisPoints: z.ZodDefault<z.ZodNumber>;
    primarySaleHappened: z.ZodDefault<z.ZodBoolean>;
    isMutable: z.ZodDefault<z.ZodBoolean>;
    editionNonce: z.ZodNullable<z.ZodNumber>;
    tokenStandard: z.ZodDefault<z.ZodNativeEnum<typeof TokenStandard>>;
    collection: z.ZodOptional<z.ZodObject<{
        verified: z.ZodOptional<z.ZodBoolean>;
        key: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        verified?: boolean | undefined;
        key?: string | undefined;
    }, {
        verified?: boolean | undefined;
        key?: string | undefined;
    }>>;
    uses: z.ZodNullable<z.ZodNativeEnum<typeof UseMethod>>;
    tokenProgramVersion: z.ZodDefault<z.ZodNativeEnum<typeof TokenProgramVersion>>;
    creators: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        verified: z.ZodOptional<z.ZodBoolean>;
        share: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }, {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    name: string;
    uri: string;
    creators: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[];
    sellerFeeBasisPoints: number;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number | null;
    tokenStandard: TokenStandard;
    uses: UseMethod | null;
    tokenProgramVersion: TokenProgramVersion;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
}, {
    name: string;
    creators: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[];
    editionNonce: number | null;
    uses: UseMethod | null;
    symbol?: string | undefined;
    uri?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    primarySaleHappened?: boolean | undefined;
    isMutable?: boolean | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
}>;
