import { defineStore } from "pinia";
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { get, merge, concat } from "lodash";
import contactUtils from "@/utils/contactUtils";
import { useApi } from "@/composables/useApi";

export const useContactStore = defineStore("contact", () => {
  const toast = useToast();
  const api = useApi();

  const contacts = ref([]);
  const pagination = ref({
    page: 1,
    pageSize: 25,
    pageCount: 1,
    total: 0,
  });
  const loading = ref(false);
  const error = ref(null);

  // Fetch contacts with pagination support
  const fetchContacts = async (page = 1, pageSize = 25) => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        pagination: {
          page: page,
          pageSize: pageSize,
        },
        sort: "createdAt:desc",
      };

      const result = await api.get("/contacts", params, {
        showToast: false,
        errorMessage: "Failed to fetch contacts",
      });

      // Update contacts and pagination using lodash
      contacts.value = get(result, "data", []);
      pagination.value = merge(
        pagination.value,
        get(result, "meta.pagination", {})
      );
    } catch (err) {
      error.value = get(err, "response.data.error.message", err.message);
      // Only log errors in development mode
      if (import.meta.env.DEV) {
        console.error("Failed to fetch contacts:", err);
      }
    } finally {
      loading.value = false;
    }
  };

  // Fetch all contacts (for components that need all data)
  const fetchAllContacts = async (params) => {
    loading.value = true;
    error.value = null;

    try {
      const queryParams = {
        sort: "createdAt:desc",
        ...params,
      };

      const result = await api.get("/contacts", queryParams, {
        showToast: false,
        errorMessage: "Failed to fetch all contacts",
      });

      contacts.value = get(result, "data", []);
      pagination.value = merge(
        pagination.value,
        get(result, "meta.pagination", {})
      );
    } catch (err) {
      error.value = get(err, "response.data.error.message", err.message);
      // Only log errors in development mode
      if (import.meta.env.DEV) {
        console.error("Failed to fetch all contacts:", err);
      }
    } finally {
      loading.value = false;
    }
  };

  // Create a new contact
  const createContact = async (contactData) => {
    loading.value = true;
    error.value = null;

    try {
      // Clean and validate contact data using utility functions
      const cleanedData = contactUtils.validation.cleanContactData(contactData);

      // Validate each field
      if (!contactUtils.validation.isValidName(cleanedData.name)) {
        throw new Error("Please enter a valid name");
      }

      if (!contactUtils.validation.isValidEmail(cleanedData.email)) {
        throw new Error("Please enter a valid email address");
      }

      if (!contactUtils.validation.isValidMessage(cleanedData.message)) {
        throw new Error("Message must be between 10 and 1000 characters");
      }

      const result = await api.post(
        "/contact",
        { data: cleanedData },
        {
          showToast: true,
          successMessage: "Contact message sent successfully!",
          errorMessage: "Failed to send contact message",
        }
      );

      // Add the new contact to the local list at the beginning
      const newContact = get(result, "data");
      if (newContact) {
        contacts.value = concat([newContact], contacts.value);
        // Update pagination total
        pagination.value.total = get(pagination.value, "total", 0) + 1;
      }

      return newContact;
    } catch (err) {
      error.value = get(err, "response.data.error.message", err.message);
      // Only log errors in development mode
      if (import.meta.env.DEV) {
        console.error("Failed to create contact:", err);
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  // Search and filter contacts using lodash
  const searchContacts = (searchTerm) => {
    return contactUtils.search.searchContacts(contacts.value, searchTerm);
  };

  // Group contacts by date
  const groupContactsByDate = () => {
    return contactUtils.stats.groupByDate(contacts.value);
  };

  // Get contacts statistics
  const getContactsStats = () => {
    return contactUtils.stats.getContactStats(contacts.value);
  };

  // Filter contacts by date range
  const filterContactsByDateRange = (startDate, endDate) => {
    return contactUtils.search.filterByDateRange(
      contacts.value,
      startDate,
      endDate
    );
  };

  // Filter contacts by email domain
  const filterContactsByDomain = (domain) => {
    return contactUtils.search.filterByDomain(contacts.value, domain);
  };

  return {
    contacts,
    pagination,
    loading,
    error,
    fetchContacts,
    fetchAllContacts,
    createContact,
    clearError,
    searchContacts,
    groupContactsByDate,
    getContactsStats,
    filterContactsByDateRange,
    filterContactsByDomain,
  };
});
