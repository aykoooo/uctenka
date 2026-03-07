export interface MerchantLogo {
    src: string;
    alt: string;
}

const MERCHANT_LOGOS: Record<string, MerchantLogo> = {
    datart: { src: "/logos/datart.png", alt: "Logo Datart" },
    ugo: { src: "/logos/ugo.png", alt: "Logo UGO" },
    fruitisimo: { src: "/logos/fruitisimo.png", alt: "Logo Fruitisimo" },
};

function normalizeMerchantName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

export function getMerchantLogo(merchantName: string): MerchantLogo | null {
    const normalized = normalizeMerchantName(merchantName);
    return MERCHANT_LOGOS[normalized] ?? null;
}

export function getMerchantFallback(merchantName: string): string {
    const parts = merchantName
        .split(/\s+/)
        .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
        .filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return "--";
}
