import {
  size,
  pick,
  mapValues,
  isString,
  truncate,
  startCase,
  toLower,
  get,
  map,
  take,
  orderBy,
  meanBy,
  uniqBy,
  memoize,
} from "lodash";
import is from "is_js";

/**
 * Validation utilities using is_js
 */
export const validation = {
  // Email validation using is_js
  isValidEmail: (email) => {
    if (!email || !is.string(email) || is.empty(email.trim())) return false;
    return is.email(email.trim());
  },

  // Name validation using is_js
  isValidName: (name) => {
    if (!name || !is.string(name) || is.empty(name.trim())) return false;
    const trimmedName = name.trim();
    // Check if it contains only letters and spaces, and is within length limit
    return /^[a-zA-Z\s]+$/.test(trimmedName) && trimmedName.length <= 255;
  },

  // Message validation using is_js
  isValidMessage: (message) => {
    if (!message || !is.string(message) || is.empty(message.trim()))
      return false;
    const trimmedMessage = message.trim();
    return trimmedMessage.length >= 10 && trimmedMessage.length <= 1000;
  },

  // Clean and validate contact data
  cleanContactData: (data) => {
    const cleaned = pick(data, ["name", "email", "message"]);
    return mapValues(cleaned, (value) =>
      is.string(value) ? value.trim() : value
    );
  },
};

/**
 * Data transformation utilities using lodash
 */
export const transform = {
  // Truncate text with smart word boundaries
  smartTruncate: (text, length = 100) => {
    if (size(text) <= length) return text;

    const truncated = truncate(text, {
      length,
      omission: "...",
      separator: /,? +/,
    });

    return truncated;
  },

  // Format dates consistently
  formatDate: (dateString, options = {}) => {
    if (!dateString || is.empty(dateString)) return "Unknown date";

    try {
      const date = new Date(dateString);
      const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      return new Intl.DateTimeFormat("en-US", {
        ...defaultOptions,
        ...options,
      }).format(date);
    } catch (err) {
      return "Invalid date";
    }
  },

  // Capitalize names properly
  capitalizeName: (name) => {
    if (!name || !is.string(name)) return "";
    return startCase(toLower(name.trim()));
  },
};

/**
 * Statistics utilities using lodash
 */
export const stats = {
  // Get contact statistics
  getContactStats: (contacts) => {
    if (!contacts || is.empty(contacts)) {
      return {
        total: 0,
        byMonth: {},
        averageMessageLength: 0,
        uniqueEmails: 0,
        topDomains: [],
        recentContacts: [],
      };
    }

    const byMonth = contacts.reduce((acc, contact) => {
      const date = new Date(get(contact, "createdAt"));
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    // Extract domains from emails
    const domains = contacts
      .map((contact) => {
        const email = get(contact, "email", "");
        if (!email || !is.string(email) || !validation.isValidEmail(email))
          return null;
        return email.trim().split("@")[1];
      })
      .filter(Boolean);

    const domainCounts = domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});

    const topDomains = take(
      orderBy(
        map(domainCounts, (count, domain) => ({ domain, count })),
        "count",
        "desc"
      ),
      5
    );

    return {
      total: size(contacts),
      byMonth,
      averageMessageLength: meanBy(contacts, (contact) =>
        size(get(contact, "message", ""))
      ),
      uniqueEmails: size(uniqBy(contacts, "email")),
      topDomains,
      recentContacts: take(orderBy(contacts, "createdAt", "desc"), 5),
    };
  },
};

/**
 * Performance utilities using lodash
 */
export const performance = {
  // Memoized calculations
  createMemoizedStats: () => {
    return memoize(stats.getContactStats, (contacts) =>
      map(contacts, "id").join(",")
    );
  },
};

export default {
  validation,
  transform,
  stats,
  performance,
};
