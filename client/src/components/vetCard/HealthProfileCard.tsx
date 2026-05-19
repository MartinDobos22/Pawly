import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { Badge as BadgeIcon } from '@mui/icons-material';
import type { PetProfile } from '../../types';

interface Props {
  dog: PetProfile;
}

function SectionHeader({ icon, title }: { icon: React.ReactElement; title: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: 'action.hover',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': { fontSize: 22 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Stack>
  );
}

function SubSection({
  label,
  items,
  color = 'default',
}: {
  label: string;
  items: string[];
  color?: 'default' | 'primary' | 'error' | 'warning';
}) {
  if (items.length === 0) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {items.map((item) => (
          <Chip key={item} label={item} size="small" color={color} variant="outlined" />
        ))}
      </Stack>
    </Box>
  );
}

export default function HealthProfileCard({ dog }: Props) {
  const chronic = dog.chronicConditions?.map((c) => c.title) ?? dog.healthConditions;
  const hasContent =
    chronic.length > 0 ||
    dog.allergies.length > 0 ||
    dog.intolerances.length > 0 ||
    Boolean(dog.notes);

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, height: '100%' }}>
      <SectionHeader icon={<BadgeIcon />} title="Zdravotný profil" />

      <SubSection label="Chronické diagnózy" items={chronic} color="primary" />
      <SubSection label="Alergie" items={dog.allergies} color="error" />
      <SubSection label="Intolerancie" items={dog.intolerances} color="warning" />

      {dog.notes && (
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant="overline"
            sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}
          >
            Poznámky
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dog.notes}
          </Typography>
        </Box>
      )}

      {!hasContent && (
        <Typography variant="body2" color="text.secondary">
          Žiadne špeciálne zdravotné záznamy.
        </Typography>
      )}
    </Card>
  );
}
