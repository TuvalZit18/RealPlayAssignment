import { readVersioned, writeVersioned } from '../../shared/storage';
import { emptyAttributionState } from './attributionSlice';
import { STORAGE_KEY, STORAGE_VERSION } from './constants';
import type { AttributionState } from './types';

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function isAttributionState(value: unknown): value is AttributionState {
  const { record, registered } = value as Partial<AttributionState>;
  if (typeof registered !== 'boolean') return false;
  if (record === null) return true;
  return (
    typeof record === 'object' &&
    record !== undefined &&
    isStringRecord(record.params) &&
    typeof record.firstTouchAt === 'number' &&
    Number.isFinite(record.firstTouchAt)
  );
}

export function loadAttributionState(): AttributionState {
  return readVersioned(STORAGE_KEY, STORAGE_VERSION, isAttributionState) ?? emptyAttributionState;
}

export function saveAttributionState(state: AttributionState): void {
  writeVersioned(STORAGE_KEY, STORAGE_VERSION, state);
}
