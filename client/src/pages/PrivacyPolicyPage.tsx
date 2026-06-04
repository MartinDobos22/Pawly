import { Box } from '@mui/material';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <PrivacyPolicyContent />
    </Box>
  );
}
