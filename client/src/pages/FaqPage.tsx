import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, HelpOutline as HelpIcon } from '@mui/icons-material';

const SECTIONS: Array<{ key: string; itemCount: number }> = [
  { key: 'dataPrivacy', itemCount: 4 },
  { key: 'photosAi', itemCount: 4 },
  { key: 'account', itemCount: 7 },
];

export default function FaqPage() {
  const { t } = useTranslation('landing');

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
        <HelpIcon color="primary" />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('faq.title')}
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('faq.subtitle')}
      </Typography>

      {SECTIONS.map(({ key, itemCount }) => (
        <Box key={key} sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'block', mb: 1, px: 0.5 }}
          >
            {t(`faq.sections.${key}.title` as never)}
          </Typography>
          <Stack spacing={1}>
            {Array.from({ length: itemCount }, (_, i) => ({
              q: t(`faq.sections.${key}.items.${i}.q` as never),
              a: t(`faq.sections.${key}.items.${i}.a` as never),
            })).map((item) => (
              <Accordion
                key={item.q}
                disableGutters
                sx={{
                  borderRadius: '8px !important',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
