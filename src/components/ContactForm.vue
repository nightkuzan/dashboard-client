<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h5 mb-4">
      <v-icon class="mr-2">mdi-message-plus</v-icon>
      Submit New Contact Message
    </v-card-title>

    <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.name"
            label="Name"
            :rules="nameRules"
            required
            prepend-inner-icon="mdi-account"
            variant="outlined"
            :disabled="loading"
            @blur="capitalizeInput('name')"
            :counter="255"
            :hint="`${characterCounts.name}/255 characters`"
            persistent-hint
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.email"
            label="Email"
            :rules="emailRules"
            required
            prepend-inner-icon="mdi-email"
            variant="outlined"
            :disabled="loading"
            :counter="255"
            :hint="`${characterCounts.email}/255 characters`"
            persistent-hint
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="formData.message"
            label="Message"
            :rules="messageRules"
            required
            prepend-inner-icon="mdi-message-text"
            variant="outlined"
            rows="4"
            :disabled="loading"
            :counter="1000"
            :hint="`${characterCounts.message}/1000 characters (minimum 10)`"
            persistent-hint
          />
        </v-col>

        <v-col cols="12">
          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="loading"
            :disabled="!valid || loading || !isFormValid"
            prepend-icon="mdi-send"
          >
            Submit Message
          </v-btn>

          <v-btn
            v-if="hasFormData"
            class="ml-2"
            variant="outlined"
            @click="resetForm"
            :disabled="loading"
          >
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mt-4"
      closable
      @click:close="clearError"
    >
      <v-icon>mdi-alert-circle</v-icon>
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useContactStore } from "@/stores/contact";
import contactUtils from "@/utils/contactUtils";

const contactStore = useContactStore();
const { loading, error, createContact, clearError, fetchContacts, pagination } =
  contactStore;

const form = ref(null);
const valid = ref(false);

const formData = reactive({
  name: "",
  email: "",
  message: "",
});

// Enhanced validation rules using utility functions
const nameRules = [
  (v) =>
    contactUtils.validation.isValidName(v) ||
    "Name must contain only letters and spaces (max 255 characters)",
];

const emailRules = [
  (v) =>
    contactUtils.validation.isValidEmail(v) ||
    "Please enter a valid email address",
  (v) =>
    (v?.trim().length || 0) <= 255 || "Email must be less than 255 characters",
];

const messageRules = [
  (v) =>
    contactUtils.validation.isValidMessage(v) ||
    "Message must be between 10 and 1000 characters",
];

// Computed properties for form validation
const isFormValid = computed(() => {
  const cleanedData = contactUtils.validation.cleanContactData(formData);
  return (
    contactUtils.validation.isValidName(cleanedData.name) &&
    contactUtils.validation.isValidEmail(cleanedData.email) &&
    contactUtils.validation.isValidMessage(cleanedData.message)
  );
});

const characterCounts = computed(() => ({
  name: formData.name?.trim().length || 0,
  email: formData.email?.trim().length || 0,
  message: formData.message?.trim().length || 0,
}));

const hasFormData = computed(() => {
  return Object.values(formData).some((value) => value?.trim());
});

const handleSubmit = async () => {
  if (!valid.value || !isFormValid.value) return;

  try {
    // Clean form data before submission using utility functions
    const cleanedData = contactUtils.validation.cleanContactData(formData);

    await createContact(cleanedData);

    // Refresh the contact list to ensure server pagination is up to date
    await fetchContacts(pagination.page, pagination.pageSize);

    resetForm();
  } catch (err) {
    // Error is handled by the store
  }
};

const resetForm = () => {
  Object.assign(formData, {
    name: "",
    email: "",
    message: "",
  });

  // Reset validation and clear form state
  if (form.value) {
    form.value.resetValidation();
    form.value.reset();
  }

  clearError();
};

// Auto-capitalize name field using utility functions
const capitalizeInput = (field) => {
  if (field === "name") {
    formData.name = contactUtils.transform.capitalizeName(formData.name);
  }
};
</script>
