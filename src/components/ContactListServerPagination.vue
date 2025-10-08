<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title
      class="text-h5 mb-4 d-flex align-center justify-space-between"
    >
      <div>
        <v-icon class="mr-2">mdi-message-text-outline</v-icon>
        Contact Messages
        <v-chip
          v-if="pagination.total"
          class="ml-2"
          size="small"
          color="primary"
        >
          {{ pagination.total }}
        </v-chip>
      </div>

      <div class="d-flex gap-2 align-center">
        <v-select
          v-model="pageSize"
          :items="pageSizeOptions"
          label="Per page"
          variant="outlined"
          class="mr-2"
          density="compact"
          style="min-width: 100px; height: 40px"
          hide-details
          @update:modelValue="handlePageSizeChange"
        />
        <v-btn
          @click="refreshContacts"
          :loading="loading"
          height="40"
          variant="outlined"
          prepend-icon="mdi-refresh"
        >
          Refresh
        </v-btn>
      </div>
    </v-card-title>

    <!-- Loading State -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- Error State -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      closable
      @click:close="clearError"
    >
      <v-icon>mdi-alert-circle</v-icon>
      {{ error }}
    </v-alert>

    <!-- Empty State -->
    <v-card
      v-if="!loading && !error && contacts.length === 0"
      class="pa-8 text-center"
      variant="outlined"
    >
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-message-outline
      </v-icon>
      <div class="text-h6 text-grey-darken-1 mb-2">No messages yet</div>
      <div class="text-body-2 text-grey">
        Submit your first contact message using the form above.
      </div>
    </v-card>

    <!-- Contact List -->
    <v-row v-if="contacts.length > 0">
      <v-col
        v-for="contact in contacts"
        :key="contact.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100" variant="outlined" hover>
          <v-card-title class="text-subtitle-1 d-flex align-center">
            <v-avatar class="mr-3" size="32" color="primary">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            {{ contact.name }}
          </v-card-title>

          <v-card-subtitle class="d-flex align-center">
            <v-icon size="16" class="mr-1">mdi-email</v-icon>
            {{ contact.email }}
          </v-card-subtitle>

          <v-card-text>
            <div class="text-body-2 mb-3">
              {{ truncateMessage(contact.message) }}
            </div>

            <div class="text-caption text-grey d-flex align-center">
              <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
              {{ formatDate(contact.createdAt) }}
            </div>
          </v-card-text>

          <v-card-actions v-if="contact.message.length > 100">
            <v-spacer />
            <v-btn
              size="small"
              variant="text"
              @click="showFullMessage(contact)"
            >
              Read More
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Server-side Pagination -->
    <div v-if="paginationInfo.hasMultiplePages" class="mt-4">
      <v-row align="center" justify="space-between">
        <v-col cols="auto"> </v-col>
        <v-col cols="auto">
          <v-pagination
            v-model="currentPage"
            :length="pagination.pageCount"
            total-visible="7"
            @update:modelValue="handlePageChange"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Full Message Dialog -->
    <v-dialog v-model="messageDialog" max-width="600">
      <v-card v-if="selectedContact">
        <v-card-title class="d-flex align-center">
          <v-avatar class="mr-3" size="40" color="primary">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6">{{ selectedContact.name }}</div>
            <div class="text-caption text-grey">
              {{ selectedContact.email }}
            </div>
          </div>
        </v-card-title>

        <v-card-text>
          <div class="text-body-1 mb-3">
            {{ selectedContact.message }}
          </div>

          <div class="text-caption text-grey d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
            {{ formatDate(selectedContact.createdAt) }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="messageDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useContactStore } from "@/stores/contact";
import { debounce, throttle } from "lodash";
import contactUtils from "@/utils/contactUtils";

const contactStore = useContactStore();
const { contacts, pagination, loading, error } = storeToRefs(contactStore);
const { fetchContacts, clearError } = contactStore;

const currentPage = ref(1);
const pageSize = ref(6);
const pageSizeOptions = [6, 12, 24, 50];
const messageDialog = ref(false);
const selectedContact = ref(null);

// Computed properties using lodash
const paginationInfo = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize + 1;
  const end = Math.min(
    pagination.value.page * pagination.value.pageSize,
    pagination.value.total
  );

  return {
    start,
    end,
    total: pagination.value.total,
    hasMultiplePages: pagination.value.pageCount > 1,
  };
});

// Watch for page changes and fetch new data
watch(
  currentPage,
  debounce((newPage) => {
    if (newPage !== pagination.value.page) {
      fetchContacts(newPage, pageSize.value);
    }
  }, 300)
);

// Methods using lodash
const refreshContacts = throttle(async () => {
  await fetchContacts(currentPage.value, pageSize.value);
}, 1000);

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePageSizeChange = debounce(() => {
  currentPage.value = 1; // Reset to first page
  fetchContacts(1, pageSize.value);
}, 300);

const truncateMessage = (message, length = 100) => {
  return contactUtils.transform.smartTruncate(message, length);
};

const formatDate = (dateString) => {
  return contactUtils.transform.formatDate(dateString);
};

const showFullMessage = (contact) => {
  selectedContact.value = { ...contact };
  messageDialog.value = true;
};

// Load contacts on mount
onMounted(() => {
  fetchContacts(currentPage.value, pageSize.value);
});
</script>
