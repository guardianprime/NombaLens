const RESPONSE_KEY = "suggestions";

function sanitizeMethod(method) {
  if (!method || typeof method !== "object") {
    return null;
  }

  const { id, priority, label } = method;
  if (typeof id !== "string" || !id) {
    return null;
  }

  return {
    id,
    priority: typeof priority === "number" ? priority : 0,
    label: typeof label === "string" ? label : id,
  };
}

export async function fetchSuggestion(apiUrl, merchantId, customerId, log) {
  const url = new URL("/widget/suggestions", apiUrl).toString();
  const payload = {
    merchantId,
    customerId,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Suggestion fetch failed with status ${response.status}`);
  }

  const data = await response.json();
  const suggestions = Array.isArray(data[RESPONSE_KEY]) ? data[RESPONSE_KEY].map(sanitizeMethod).filter(Boolean) : [];

  if (suggestions.length === 0) {
    throw new Error("Suggestion endpoint returned no valid suggestions.");
  }

  log("Fetched suggestions", suggestions);
  return suggestions;
}

export function reorderMethods(candidates, log) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    log("No candidates supplied to reorderMethods.");
    return [];
  }

  const sorted = [...candidates].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return a.id.localeCompare(b.id);
  });

  const form = document.querySelector("form[action*='/checkout']");
  if (!form) {
    log("Checkout form not found on page.");
    return sorted;
  }

  const elements = Array.from(form.elements).filter((element) => element.name === "paymentMethod");
  if (elements.length === 0) {
    log("No paymentMethod inputs found inside checkout form.");
    return sorted;
  }

  const existing = elements.reduce((map, element) => {
    if (element && typeof element.value === "string") {
      map.set(element.value, element);
    }
    return map;
  }, new Map());

  sorted.forEach((method) => {
    const element = existing.get(method.id);
    if (!element || !element.parentNode) {
      return;
    }
    element.parentNode.appendChild(element);
  });

  log("Payment methods reordered using suggestions.");
  return sorted;
}
