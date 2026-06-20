import { createElement, type ReactElement } from 'react';
import FoodAnalysisLandingPage, {
  seo as foodAnalysisSeo,
} from '../pages/public/FoodAnalysisLandingPage';
import HealthPassportLandingPage, {
  seo as healthPassportSeo,
} from '../pages/public/HealthPassportLandingPage';
import VaccinationLandingPage, { seo as vaccinationSeo } from '../pages/public/VaccinationLandingPage';
import DewormingLandingPage, { seo as dewormingSeo } from '../pages/public/DewormingLandingPage';
import FoodAllergyLandingPage, { seo as foodAllergySeo } from '../pages/public/FoodAllergyLandingPage';
import ForbiddenFoodsLandingPage, {
  seo as forbiddenFoodsSeo,
} from '../pages/public/ForbiddenFoodsLandingPage';
import InfoPublicPage, { seo as infoSeo } from '../pages/public/InfoPublicPage';
import ContactPublicPage, { seo as contactSeo } from '../pages/public/ContactPublicPage';

export interface PageSeo {
  title: string;
  description: string;
  path: string;
  jsonLd?: object;
}

export interface SsgRoute {
  element: ReactElement;
  seo: PageSeo;
}

const props = { darkMode: false, onToggleTheme: () => {} };

export const publicRoutes: SsgRoute[] = [
  { element: createElement(FoodAnalysisLandingPage, props), seo: foodAnalysisSeo },
  { element: createElement(HealthPassportLandingPage, props), seo: healthPassportSeo },
  { element: createElement(VaccinationLandingPage, props), seo: vaccinationSeo },
  { element: createElement(DewormingLandingPage, props), seo: dewormingSeo },
  { element: createElement(FoodAllergyLandingPage, props), seo: foodAllergySeo },
  { element: createElement(ForbiddenFoodsLandingPage, props), seo: forbiddenFoodsSeo },
  { element: createElement(InfoPublicPage, props), seo: infoSeo },
  { element: createElement(ContactPublicPage, props), seo: contactSeo },
];
