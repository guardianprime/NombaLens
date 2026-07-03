import { fetchSuggestion, reorderMethods } from "./suggestion.js";

const DEFAULT_TIMEOUT = 3000;

function hasValidConfig(config) {
  return config && typeof config === "object" && typeof config.merchantId === "string" && config.merchantId && typeof config.apiUrl === "string" && config.apiUrl;
}

function createLogger(debug) {
  return (...args) => {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("NombaLens:", ...args);
    }
  };
}

function waitForDomReady() {
  return new Promise((resolve) => {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      resolve();
      return;
    }

    document.addEventListener("DOMContentLoaded", () => {
      resolve();
    });
  });
}

function createTimeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const NombaLens = {
  async init(config) {
    const debug = Boolean(config && config.debug);
    const log = createLogger(debug);

    try {
      if (!hasValidConfig(config)) {
        log("Invalid config supplied to NombaLens.init. merchantId and apiUrl are required.");
        return;
      }

      const timeoutMs = typeof config.timeout === "number" && config.timeout > 0 ? config.timeout : DEFAULT_TIMEOUT;
      const merchantId = config.merchantId;
      const apiUrl = config.apiUrl;
      const customerId = typeof config.customerId === "string" ? config.customerId : undefined;

      await waitForDomReady();

      const fetchPromise = fetchSuggestion(apiUrl, merchantId, customerId, log);
      const ranked = await Promise.race([
        fetchPromise,
        createTimeout(timeoutMs).then(() => {
          throw new Error("Suggestion fetch timed out");
        }),
      ]);

      if (!Array.isArray(ranked) || ranked.length === 0) {
        log("No ranked suggestion received, skipping reorder.");
        return;
      }

      const reordered = reorderMethods(ranked, log);
      log("Reorder completed:", reordered);
    } catch (error) {
      log("Widget init failed:", error);
    }
  },
};

window.NombaLens = NombaLens;
