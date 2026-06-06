import type { PetProfile } from './index';

export type FoodSafetyVerdict = 'SAFE' | 'CAUTION' | 'UNSAFE' | 'INVALID';

export interface FoodSafetyRequest {
  query: string;
  petProfile?: PetProfile;
}

export interface FoodSafetyResult {
  query: string;
  verdict: FoodSafetyVerdict;
  shortAnswer: string;
  explanation: string;
  alternatives?: string[];
  warnings?: string[];
  source: 'openai' | 'mock';
}
