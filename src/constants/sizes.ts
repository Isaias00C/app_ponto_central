export const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'] as const;

export type Size = (typeof SIZES)[number];
