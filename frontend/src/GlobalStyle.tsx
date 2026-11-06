import { Global, css } from '@emotion/react';
import { theme } from './theme/theme';
import { COLORS } from './theme/tokens';

export const GlobalStyle = () => (
  <Global
    styles={css`
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: ${theme.typography.fontFamily};
        background-color: ${COLORS.background};
        color: ${COLORS.textPrimary};
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      ::selection {
        background: rgba(91, 127, 255, 0.35);
      }
    `}
  />
);
