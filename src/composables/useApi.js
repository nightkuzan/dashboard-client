import { ref } from "vue";
import api from "@/utils/axios";
import { get, isFunction, omitBy, isNil, map, filter, isEmpty } from "lodash";
import { useToast } from "vue-toastification";

export function useApi() {
  const toast = useToast();
  const loading = ref(false);
  const error = ref(null);

  // Generic API call function with lodash utilities
  const makeApiCall = async (apiCall, options = {}) => {
    const {
      showToast = true,
      successMessage = null,
      errorMessage = null,
      transformResponse = null,
    } = options;

    loading.value = true;
    error.value = null;

    try {
      const response = await apiCall();
      let result = response.data;

      // Transform response if function provided
      if (isFunction(transformResponse)) {
        result = transformResponse(result);
      }

      // Show success toast if configured
      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (err) {
      // Extract error message using lodash
      const extractedError = get(
        err,
        "response.data.error.message",
        get(
          err,
          "response.data.message",
          get(err, "message", "An unexpected error occurred")
        )
      );

      error.value = extractedError;

      // Show error toast if configured
      if (showToast) {
        const displayError = errorMessage || extractedError;
        toast.error(displayError);
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  // GET request with lodash query parameter handling
  const get = async (url, params = {}, options = {}) => {
    return makeApiCall(
      () => api.get(url, { params: omitBy(params, isNil) }),
      options
    );
  };

  // POST request with data validation
  const post = async (url, data = {}, options = {}) => {
    // Clean data before sending
    const cleanData = omitBy(data, isNil);

    return makeApiCall(() => api.post(url, cleanData), options);
  };

  // PUT request with data validation
  const put = async (url, data = {}, options = {}) => {
    const cleanData = omitBy(data, isNil);

    return makeApiCall(() => api.put(url, cleanData), options);
  };

  // DELETE request
  const del = async (url, options = {}) => {
    return makeApiCall(() => api.delete(url), options);
  };

  // PATCH request with data validation
  const patch = async (url, data = {}, options = {}) => {
    const cleanData = omitBy(data, isNil);

    return makeApiCall(() => api.patch(url, cleanData), options);
  };

  // Batch requests with lodash utilities
  const batch = async (requests, options = {}) => {
    const { concurrent = false, showToast = true, failFast = true } = options;

    loading.value = true;
    error.value = null;

    try {
      let results;

      if (concurrent) {
        // Execute all requests concurrently
        results = await Promise.allSettled(
          map(requests, (request) => request())
        );

        // Check for failures if failFast is enabled
        if (failFast) {
          const failures = filter(results, { status: "rejected" });
          if (!isEmpty(failures)) {
            throw new Error(`${failures.length} requests failed`);
          }
        }

        // Extract successful results
        results = map(filter(results, { status: "fulfilled" }), "value");
      } else {
        // Execute requests sequentially
        results = [];
        for (const request of requests) {
          try {
            const result = await request();
            results.push(result);
          } catch (err) {
            if (failFast) throw err;
            results.push({ error: err });
          }
        }
      }

      if (showToast) {
        toast.success(`Completed ${results.length} requests`);
      }

      return results;
    } catch (err) {
      const extractedError = get(err, "message", "Batch request failed");
      error.value = extractedError;

      if (showToast) {
        toast.error(extractedError);
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Clear error state
  const clearError = () => {
    error.value = null;
  };

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    del,
    batch,
    clearError,
    makeApiCall,
  };
}
