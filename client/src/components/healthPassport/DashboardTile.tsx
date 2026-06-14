import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { md3 } from './md3';

/**
 * Jednotná dlaždica dashboardu Zdravotného pasu — pokojné tonálne karty odvodené z MD3 tokenov
 * (`md3()`): veľké zaoblenie, jemná hairline a soft elevation. Jediný zdroj vzhľadu dlaždíc, aby
 * prehľad pôsobil ako jeden dizajnový jazyk, nie ako sada náhodných bielych kariet. Akcenty
 * (tónované pozadie, hover) si jednotlivé dlaždice doplnia cez `sx`.
 */
const DashboardTile = styled(Card)(({ theme }) => {
  const m = md3(theme);
  return {
    borderRadius: theme.spacing(2.5),
    border: `1px solid ${m.outlineVariant}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: m.elevation1,
  };
});

export default DashboardTile;
