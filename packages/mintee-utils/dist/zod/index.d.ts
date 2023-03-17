import { z } from "zod";
import { TokenStandard, UseMethod, TokenProgramVersion } from "../types";
export declare function validateMintCompressBody(json: {
    data: any;
    options?: any;
}): Promise<void | [z.SafeParseReturnType<{
    name: string;
    symbol?: string | undefined;
    uri?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    primarySaleHappened?: boolean | undefined;
    isMutable?: boolean | undefined;
    editionNonce?: number | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
    uses?: UseMethod | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
    creators?: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[] | undefined;
}, {
    name: string;
    uri: string;
    sellerFeeBasisPoints: number;
    primarySaleHappened: boolean;
    isMutable: boolean;
    symbol?: string | undefined;
    editionNonce?: number | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
    uses?: UseMethod | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
    creators?: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[] | undefined;
}>, z.SafeParseReturnType<{
    toWalletAddress?: string | undefined;
    network?: string | undefined;
} | null | undefined, {
    toWalletAddress?: string | undefined;
    network?: string | undefined;
} | null | undefined>]>;
export declare const mintCompressOptionsSchema: z.ZodNullable<z.ZodOptional<z.ZodObject<{
    toWalletAddress: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    toWalletAddress?: string | undefined;
    network?: string | undefined;
}, {
    toWalletAddress?: string | undefined;
    network?: string | undefined;
}>>>;
export declare const mintCompressBodySchema: z.ZodObject<{
    name: z.ZodString;
    symbol: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    uri: z.ZodDefault<z.ZodString>;
    sellerFeeBasisPoints: z.ZodDefault<z.ZodNumber>;
    primarySaleHappened: z.ZodDefault<z.ZodBoolean>;
    isMutable: z.ZodDefault<z.ZodBoolean>;
    editionNonce: z.ZodOptional<z.ZodNumber>;
    tokenStandard: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof TokenStandard>>>;
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
    uses: z.ZodOptional<z.ZodNativeEnum<typeof UseMethod>>;
    tokenProgramVersion: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof TokenProgramVersion>>>;
    creators: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    uri: string;
    sellerFeeBasisPoints: number;
    primarySaleHappened: boolean;
    isMutable: boolean;
    symbol?: string | undefined;
    editionNonce?: number | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
    uses?: UseMethod | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
    creators?: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[] | undefined;
}, {
    name: string;
    symbol?: string | undefined;
    uri?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    primarySaleHappened?: boolean | undefined;
    isMutable?: boolean | undefined;
    editionNonce?: number | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
    uses?: UseMethod | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
    creators?: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[] | undefined;
}>;
export type mintCompressBody = z.infer<typeof mintCompressBodySchema>;
