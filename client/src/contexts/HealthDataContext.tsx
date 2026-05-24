import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  DewormingRecord,
  DietEntry,
  EctoparasiteRecord,
  ExpenseRecord,
  MedicationDoseLog,
  MedicationRecord,
  VaccinationRecord,
  VetVisitRecord,
} from '../types/dogHealth';
import type { HealthEpisodeRecord } from '../types/healthEpisode';
import type { SavedAnalysis } from '../types';
import type { VisitBundle } from '../utils/vetVisitHelper';
import {
  createVisitBundle,
  dewormingsApi,
  dietEntriesApi,
  doseLogsApi,
  ectoparasitesApi,
  episodesApi,
  expensesApi,
  medicationsApi,
  savedAnalysesApi,
  vaccinationsApi,
  vetVisitsApi,
  type CrudApi,
} from '../services/healthApi';

interface Collection<T> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  add: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

function useCollection<T extends { id: string }>(api: CrudApi<T>): Collection<T> {
  const [items, setItems] = useState<T[]>([]);
  const add = useCallback(
    async (payload: Partial<T>) => {
      const created = await api.create(payload);
      setItems((prev) => [...prev, created]);
      return created;
    },
    [api]
  );
  const update = useCallback(
    async (id: string, payload: Partial<T>) => {
      const updated = await api.update(id, payload);
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      return updated;
    },
    [api]
  );
  const remove = useCallback(
    async (id: string) => {
      await api.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    },
    [api]
  );
  return { items, setItems, add, update, remove };
}

export interface HealthDataContextValue {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  vaccinations: VaccinationRecord[];
  dewormings: DewormingRecord[];
  ectos: EctoparasiteRecord[];
  visits: VetVisitRecord[];
  medications: MedicationRecord[];
  doseLogs: MedicationDoseLog[];
  dietEntries: DietEntry[];
  expenses: ExpenseRecord[];
  episodes: HealthEpisodeRecord[];
  savedAnalyses: SavedAnalysis[];

  addVaccination: Collection<VaccinationRecord>['add'];
  updateVaccination: Collection<VaccinationRecord>['update'];
  removeVaccination: Collection<VaccinationRecord>['remove'];
  addDeworming: Collection<DewormingRecord>['add'];
  updateDeworming: Collection<DewormingRecord>['update'];
  removeDeworming: Collection<DewormingRecord>['remove'];
  addEcto: Collection<EctoparasiteRecord>['add'];
  updateEcto: Collection<EctoparasiteRecord>['update'];
  removeEcto: Collection<EctoparasiteRecord>['remove'];
  addVisit: Collection<VetVisitRecord>['add'];
  updateVisit: Collection<VetVisitRecord>['update'];
  removeVisit: Collection<VetVisitRecord>['remove'];
  addDietEntry: Collection<DietEntry>['add'];
  updateDietEntry: Collection<DietEntry>['update'];
  removeDietEntry: Collection<DietEntry>['remove'];
  addExpense: Collection<ExpenseRecord>['add'];
  updateExpense: Collection<ExpenseRecord>['update'];
  removeExpense: Collection<ExpenseRecord>['remove'];

  addEpisode: Collection<HealthEpisodeRecord>['add'];
  updateEpisode: Collection<HealthEpisodeRecord>['update'];
  removeEpisode: Collection<HealthEpisodeRecord>['remove'];

  addMedication: Collection<MedicationRecord>['add'];
  updateMedication: Collection<MedicationRecord>['update'];
  toggleDose: (logId: string) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  addVisitBundle: (bundle: VisitBundle) => Promise<void>;

  addSavedAnalysis: (payload: Partial<SavedAnalysis>) => Promise<SavedAnalysis>;
  removeSavedAnalysis: (id: string) => Promise<void>;
  clearSavedAnalyses: () => Promise<void>;
}

export const HealthDataContext = createContext<HealthDataContextValue | null>(null);

export function HealthDataProvider({ children }: { children: ReactNode }) {
  const vaccinations = useCollection<VaccinationRecord>(vaccinationsApi);
  const dewormings = useCollection<DewormingRecord>(dewormingsApi);
  const ectos = useCollection<EctoparasiteRecord>(ectoparasitesApi);
  const visits = useCollection<VetVisitRecord>(vetVisitsApi);
  const medications = useCollection<MedicationRecord>(medicationsApi);
  const doseLogs = useCollection<MedicationDoseLog>(doseLogsApi);
  const dietEntries = useCollection<DietEntry>(dietEntriesApi);
  const expenses = useCollection<ExpenseRecord>(expensesApi);
  const episodes = useCollection<HealthEpisodeRecord>(episodesApi);

  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, d, e, vi, m, dl, di, ex, ep, sa] = await Promise.all([
        vaccinationsApi.list(),
        dewormingsApi.list(),
        ectoparasitesApi.list(),
        vetVisitsApi.list(),
        medicationsApi.list(),
        doseLogsApi.list(),
        dietEntriesApi.list(),
        expensesApi.list(),
        episodesApi.list(),
        savedAnalysesApi.list(),
      ]);
      vaccinations.setItems(v);
      dewormings.setItems(d);
      ectos.setItems(e);
      visits.setItems(vi);
      medications.setItems(m);
      doseLogs.setItems(dl);
      dietEntries.setItems(di);
      expenses.setItems(ex);
      episodes.setItems(ep);
      setSavedAnalyses(sa);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Načítanie zdravotných dát zlyhalo.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const toggleDose = useCallback(
    async (logId: string) => {
      const log = doseLogs.items.find((x) => x.id === logId);
      if (!log) return;
      await doseLogs.update(logId, { taken: !log.taken });
    },
    [doseLogs]
  );

  const removeMedication = useCallback(
    async (id: string) => {
      await medicationsApi.remove(id);
      medications.setItems((prev) => prev.filter((x) => x.id !== id));
      // server kaskádne zmazal dose-logy a odstránil id z návštev — premietni
      const [freshDoseLogs, freshVisits] = await Promise.all([doseLogsApi.list(), vetVisitsApi.list()]);
      doseLogs.setItems(freshDoseLogs);
      visits.setItems(freshVisits);
    },
    [medications, doseLogs, visits]
  );

  const addVisitBundle = useCallback(
    async (bundle: VisitBundle) => {
      const created = await createVisitBundle(bundle);
      visits.setItems((prev) => [...prev, created.visit]);
      vaccinations.setItems((prev) => [...prev, ...created.vaccinations]);
      dewormings.setItems((prev) => [...prev, ...created.dewormings]);
      ectos.setItems((prev) => [...prev, ...created.ectos]);
      medications.setItems((prev) => [...prev, ...created.medications]);
      doseLogs.setItems((prev) => [...prev, ...created.doseLogs]);
      dietEntries.setItems((prev) => [...prev, ...created.dietEntries]);
      expenses.setItems((prev) => [...prev, ...created.expenses]);
    },
    [visits, vaccinations, dewormings, ectos, medications, doseLogs, dietEntries, expenses]
  );

  const addSavedAnalysis = useCallback(async (payload: Partial<SavedAnalysis>) => {
    const created = await savedAnalysesApi.create(payload);
    setSavedAnalyses((prev) => [created, ...prev]);
    return created;
  }, []);

  const removeSavedAnalysis = useCallback(async (id: string) => {
    await savedAnalysesApi.remove(id);
    setSavedAnalyses((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearSavedAnalyses = useCallback(async () => {
    await savedAnalysesApi.clear();
    setSavedAnalyses([]);
  }, []);

  const value = useMemo<HealthDataContextValue>(
    () => ({
      loading,
      error,
      refetch,
      vaccinations: vaccinations.items,
      dewormings: dewormings.items,
      ectos: ectos.items,
      visits: visits.items,
      medications: medications.items,
      doseLogs: doseLogs.items,
      dietEntries: dietEntries.items,
      expenses: expenses.items,
      episodes: episodes.items,
      savedAnalyses,
      addVaccination: vaccinations.add,
      updateVaccination: vaccinations.update,
      removeVaccination: vaccinations.remove,
      addDeworming: dewormings.add,
      updateDeworming: dewormings.update,
      removeDeworming: dewormings.remove,
      addEcto: ectos.add,
      updateEcto: ectos.update,
      removeEcto: ectos.remove,
      addVisit: visits.add,
      updateVisit: visits.update,
      removeVisit: visits.remove,
      addDietEntry: dietEntries.add,
      updateDietEntry: dietEntries.update,
      removeDietEntry: dietEntries.remove,
      addExpense: expenses.add,
      updateExpense: expenses.update,
      removeExpense: expenses.remove,
      addEpisode: episodes.add,
      updateEpisode: episodes.update,
      removeEpisode: episodes.remove,
      addMedication: medications.add,
      updateMedication: medications.update,
      toggleDose,
      removeMedication,
      addVisitBundle,
      addSavedAnalysis,
      removeSavedAnalysis,
      clearSavedAnalyses,
    }),
    [
      loading,
      error,
      refetch,
      vaccinations,
      dewormings,
      ectos,
      visits,
      medications,
      doseLogs,
      dietEntries,
      expenses,
      episodes,
      savedAnalyses,
      toggleDose,
      removeMedication,
      addVisitBundle,
      addSavedAnalysis,
      removeSavedAnalysis,
      clearSavedAnalyses,
    ]
  );

  return <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>;
}
