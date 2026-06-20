import { useTranslation } from 'react-i18next';
import type { SymptomField } from '../utils/checkInTrends';

export type CheckInLabelMap = Record<SymptomField, Record<string, string>>;

/** Preložené labely hodnôt check-in príznakov (literálne i18n kľúče, typovo bezpečné). */
export function useCheckInLabels(): CheckInLabelMap {
  const { t } = useTranslation();
  return {
    appetite: {
      normal: t('checkIn.appetite.normal'),
      less: t('checkIn.appetite.less'),
      more: t('checkIn.appetite.more'),
      refuses: t('checkIn.appetite.refuses'),
    },
    energy: {
      normal: t('checkIn.energy.normal'),
      lower: t('checkIn.energy.lower'),
      higher: t('checkIn.energy.higher'),
      very_low: t('checkIn.energy.very_low'),
    },
    stool: {
      normal: t('checkIn.stool.normal'),
      soft: t('checkIn.stool.soft'),
      diarrhea: t('checkIn.stool.diarrhea'),
      constipation: t('checkIn.stool.constipation'),
      blood_mucus: t('checkIn.stool.blood_mucus'),
    },
    skinCoat: {
      normal: t('checkIn.skinCoat.normal'),
      itching: t('checkIn.skinCoat.itching'),
      redness: t('checkIn.skinCoat.redness'),
      dandruff: t('checkIn.skinCoat.dandruff'),
      hair_loss: t('checkIn.skinCoat.hair_loss'),
    },
    behavior: {
      normal: t('checkIn.behavior.normal'),
      apathetic: t('checkIn.behavior.apathetic'),
      nervous: t('checkIn.behavior.nervous'),
      aggressive: t('checkIn.behavior.aggressive'),
      pain: t('checkIn.behavior.pain'),
    },
  };
}
