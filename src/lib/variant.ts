// Phase 1 builds the same pages twice: VARIANT=a ("Faculty page", default)
// and VARIANT=b ("Plain text"). B_FONT picks the Variant B font.
export const VARIANT: 'a' | 'b' = process.env.VARIANT === 'b' ? 'b' : 'a';
export const B_FONT: 'courier' | 'plex' = process.env.B_FONT === 'plex' ? 'plex' : 'courier';
