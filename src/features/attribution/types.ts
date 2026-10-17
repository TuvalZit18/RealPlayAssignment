export type AttributionParams = Record<string, string>;

export interface AttributionRecord {
  params: AttributionParams;
  /** Epoch milliseconds of the first touch. */
  firstTouchAt: number;
}

export interface AttributionState {
  record: AttributionRecord | null;
  /** Set once registration succeeds; later visits are no longer captured. */
  registered: boolean;
}
