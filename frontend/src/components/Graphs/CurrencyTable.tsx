import React from 'react';
import { thStyle, tdStyle } from '../UI/table';
import { COLORS } from '../../theme/tokens';

export interface CurrencyTableProps {
  data: Record<
    string,
    Record<
      string,
      {
        buy: number | string;
        sell: number | string;
      }
    >
  >;
}

const CurrencyTable: React.FC<CurrencyTableProps> = ({ data }) => {
  if (!data) return null;

  const allCurrencies = Array.from(
    new Set(
      Object.values(data)
        .flatMap((rates) => Object.keys(rates))
        .sort(),
    ),
  );

  const missingCellStyle = { ...tdStyle, color: COLORS.textMuted };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr>
          <th style={thStyle}>Bank</th>
          {allCurrencies.map((currency) => (
            <th key={currency} colSpan={2} style={thStyle}>
              {currency}
            </th>
          ))}
        </tr>
        <tr>
          <th style={thStyle}></th>
          {allCurrencies.map((currency) => (
            <React.Fragment key={`${currency}-headers`}>
              <th style={thStyle}>Buy</th>
              <th style={thStyle}>Sell</th>
            </React.Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([bank, rates]) => (
          <tr key={bank}>
            <td style={tdStyle}>
              <strong>{bank}</strong>
            </td>
            {allCurrencies.map((currency) => {
              const rate = rates ? rates[currency] : undefined;
              return rate ? (
                <React.Fragment key={`${bank}-${currency}`}>
                  <td style={tdStyle}>{rate.buy}</td>
                  <td style={tdStyle}>{rate.sell}</td>
                </React.Fragment>
              ) : (
                <React.Fragment key={`${bank}-${currency}`}>
                  <td style={missingCellStyle}>-</td>
                  <td style={missingCellStyle}>-</td>
                </React.Fragment>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CurrencyTable;
