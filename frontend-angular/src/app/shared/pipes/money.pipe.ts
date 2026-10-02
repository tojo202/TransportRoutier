import { Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_CURRENCY, CurrencyConfig } from '../config/currency';

@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currencyConfig: CurrencyConfig = DEFAULT_CURRENCY,
    decimalPlaces: number = 0
  ): string {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return `0 ${currencyConfig.symbol}`;
    }

    const num = Number(value);
    const formattedNum = num.toLocaleString('fr-FR', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    return currencyConfig.format === 'prefix'
      ? `${currencyConfig.symbol} ${formattedNum}`
      : `${formattedNum} ${currencyConfig.symbol}`;
  }
}