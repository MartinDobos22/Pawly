const QUICK_VISIT_CLINIC_SUGGESTION_MAX_LENGTH = 64;

const quickVisitClinicSuggestionByDogId = new Map<string, string>();

function normalizeClinicSuggestion(clinic: string) {
  return clinic
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, QUICK_VISIT_CLINIC_SUGGESTION_MAX_LENGTH);
}

export function getQuickVisitClinicSuggestion(dogId: string) {
  return quickVisitClinicSuggestionByDogId.get(dogId) ?? '';
}

export function rememberQuickVisitClinicSuggestion(dogId: string, clinic: string) {
  const suggestion = normalizeClinicSuggestion(clinic);
  if (!dogId || !suggestion) return;
  quickVisitClinicSuggestionByDogId.set(dogId, suggestion);
}

export function forgetQuickVisitClinicSuggestion(dogId: string) {
  quickVisitClinicSuggestionByDogId.delete(dogId);
}

export function clearQuickVisitClinicSuggestions() {
  quickVisitClinicSuggestionByDogId.clear();
}
