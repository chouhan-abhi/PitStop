import { QUERY_ARCHIVE_DEFAULTS, QUERY_LIVE_DEFAULTS } from "./utils/queryDefaults";

export const AppConfig = {
  name: "F1 PitStop",
  description: "A dashboard for F1 sports data",
  version: "2.0.0",
};

export const APP_CACHE_CONFIG = QUERY_ARCHIVE_DEFAULTS;
export const APP_LIVE_CACHE_CONFIG = QUERY_LIVE_DEFAULTS;
