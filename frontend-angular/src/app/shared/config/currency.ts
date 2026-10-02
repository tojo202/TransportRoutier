export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  format: 'suffix' | 'prefix';
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: 'MGA',
  symbol: 'Ar',
  name: 'Ariary',
  format: 'suffix',
};