import { z } from "zod";
import { TokenStandard, UseMethod, TokenProgramVersion } from "../types";
export declare function validateMintCompressBody(json: {
    data: any;
    options?: any;
}): Promise<void | [z.SafeParseReturnType<{
    name: string;
    symbol?: string | undefined;
    description?: string | undefined;
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
    description?: string | undefined;
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
export declare function validateOffChainBody(body: any): Promise<void | z.SafeParseReturnType<{
    name: string;
    symbol?: string | undefined;
    description?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    image?: string | undefined;
    externalUrl?: string | undefined;
    attributes?: {
        trait_type?: string | undefined;
        value?: string | undefined;
    }[] | undefined;
    properties?: {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    } | undefined;
}, {
    name: string;
    sellerFeeBasisPoints: number;
    symbol?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    externalUrl?: string | undefined;
    attributes?: {
        trait_type?: string | undefined;
        value?: string | undefined;
    }[] | undefined;
    properties?: {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    } | undefined;
}>>;
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
export declare const minteeNFTInputSchema: z.ZodObject<{
    name: z.ZodString;
    symbol: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    uri: z.ZodOptional<z.ZodString>;
    sellerFeeBasisPoints: z.ZodOptional<z.ZodNumber>;
    primarySaleHappened: z.ZodOptional<z.ZodBoolean>;
    isMutable: z.ZodOptional<z.ZodBoolean>;
    editionNonce: z.ZodOptional<z.ZodNumber>;
    tokenStandard: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof TokenStandard>>>;
    collection: z.ZodOptional<z.ZodObject<{
        verified: z.ZodOptional<z.ZodBoolean>;
        address: z.ZodOptional<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        verified?: boolean | undefined;
        address?: string | undefined;
        key?: string | undefined;
    }, {
        verified?: boolean | undefined;
        address?: string | undefined;
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
    image: z.ZodOptional<z.ZodString>;
    externalUrl: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        trait_type: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        trait_type?: string | undefined;
        value?: string | undefined;
    }, {
        trait_type?: string | undefined;
        value?: string | undefined;
    }>, "many">>;
    properties: z.ZodOptional<z.ZodObject<{
        creators: z.ZodOptional<z.ZodArray<z.ZodObject<{
            address: z.ZodString;
            share: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            address: string;
            share: number;
        }, {
            address: string;
            share: number;
        }>, "many">>;
        files: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            type?: string | undefined;
        }, {
            uri: string;
            type?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    }, {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    symbol?: string | undefined;
    description?: string | undefined;
    uri?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    primarySaleHappened?: boolean | undefined;
    isMutable?: boolean | undefined;
    editionNonce?: number | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        address?: string | undefined;
        key?: string | undefined;
    } | undefined;
    uses?: UseMethod | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
    creators?: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[] | undefined;
    image?: string | undefined;
    externalUrl?: string | undefined;
    attributes?: {
        trait_type?: string | undefined;
        value?: string | undefined;
    }[] | undefined;
    properties?: {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    } | undefined;
}, {
    name: string;
    symbol?: string | undefined;
    description?: string | undefined;
    uri?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    primarySaleHappened?: boolean | undefined;
    isMutable?: boolean | undefined;
    editionNonce?: number | undefined;
    tokenStandard?: TokenStandard | undefined;
    collection?: {
        verified?: boolean | undefined;
        address?: string | undefined;
        key?: string | undefined;
    } | undefined;
    uses?: UseMethod | undefined;
    tokenProgramVersion?: TokenProgramVersion | undefined;
    creators?: {
        address: string;
        share: number;
        verified?: boolean | undefined;
    }[] | undefined;
    image?: string | undefined;
    externalUrl?: string | undefined;
    attributes?: {
        trait_type?: string | undefined;
        value?: string | undefined;
    }[] | undefined;
    properties?: {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    } | undefined;
}>;
export type minteeNFTInput = z.infer<typeof minteeNFTInputSchema>;
export type minteeNFTInfo = minteeNFTInput & {
    blockchainAddress: string;
    updateAuthorityAddress: string;
};
export declare const mintCompressBodySchema: z.ZodObject<{
    name: z.ZodString;
    symbol: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
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
    description?: string | undefined;
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
    description?: string | undefined;
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
export declare const offChainMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    symbol: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    sellerFeeBasisPoints: z.ZodDefault<z.ZodNumber>;
    image: z.ZodOptional<z.ZodString>;
    externalUrl: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        trait_type: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        trait_type?: string | undefined;
        value?: string | undefined;
    }, {
        trait_type?: string | undefined;
        value?: string | undefined;
    }>, "many">>;
    properties: z.ZodOptional<z.ZodObject<{
        creators: z.ZodOptional<z.ZodArray<z.ZodObject<{
            address: z.ZodString;
            share: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            address: string;
            share: number;
        }, {
            address: string;
            share: number;
        }>, "many">>;
        files: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            uri: string;
            type?: string | undefined;
        }, {
            uri: string;
            type?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    }, {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sellerFeeBasisPoints: number;
    symbol?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    externalUrl?: string | undefined;
    attributes?: {
        trait_type?: string | undefined;
        value?: string | undefined;
    }[] | undefined;
    properties?: {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    } | undefined;
}, {
    name: string;
    symbol?: string | undefined;
    description?: string | undefined;
    sellerFeeBasisPoints?: number | undefined;
    image?: string | undefined;
    externalUrl?: string | undefined;
    attributes?: {
        trait_type?: string | undefined;
        value?: string | undefined;
    }[] | undefined;
    properties?: {
        creators?: {
            address: string;
            share: number;
        }[] | undefined;
        files?: {
            uri: string;
            type?: string | undefined;
        }[] | undefined;
    } | undefined;
}>;
