import { Accordion, AccordionDetails, AccordionSummary, Typography, useTheme } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { FaqItem } from '../../utils/seoSchema';

interface Props {
  title: string;
  faqs: FaqItem[];
}

export default function LandingFaq({ title, faqs }: Props) {
  const theme = useTheme();
  return (
    <section>
      <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(2) }}>
        {title}
      </Typography>
      {faqs.map((f, i) => (
        <Accordion key={i} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{f.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {f.a}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </section>
  );
}
