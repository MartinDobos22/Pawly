const QUICK_VISIT_CLINIC_SUGGESTION_MAX_LENGTH = 64;

const quickVisitClinicSuggestionByDogId = new Map<string, string>();

function normalizeClinicSuggestion(clinic: string) {
  return clinic.trim().replace(/\s+/g, ' ').slice(0, QUICK_VISIT_CLINIC_SUGGESTION_MAX_LENGTH);
}

export function getQuickVisitClinicSuggestion(petId: string) {
  return quickVisitClinicSuggestionByDogId.get(petId) ?? '';
}

export function rememberQuickVisitClinicSuggestion(petId: string, clinic: string) {
  const suggestion = normalizeClinicSuggestion(clinic);
  if (!petId || !suggestion) return;
  quickVisitClinicSuggestionByDogId.set(petId, suggestion);
}

export function forgetQuickVisitClinicSuggestion(petId: string) {
  quickVisitClinicSuggestionByDogId.delete(petId);
}

export function clearQuickVisitClinicSuggestions() {
  quickVisitClinicSuggestionByDogId.clear();
}
