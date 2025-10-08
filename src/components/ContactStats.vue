<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h5 mb-4">
      <v-icon class="mr-2">mdi-chart-bar</v-icon>
      Contact Statistics
    </v-card-title>

    <!-- Loading State -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- Statistics Grid -->
    <v-row v-if="!loading && stats">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="text-center pa-4">
          <v-icon size="40" color="primary" class="mb-2">
            mdi-message-text
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
          <div class="text-body-2 text-grey">Total Messages</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="text-center pa-4">
          <v-icon size="40" color="success" class="mb-2">
            mdi-email-multiple
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ stats.uniqueEmails }}</div>
          <div class="text-body-2 text-grey">Unique Contacts</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="text-center pa-4">
          <v-icon size="40" color="info" class="mb-2"> mdi-format-text </v-icon>
          <div class="text-h4 font-weight-bold">
            {{ Math.round(stats.averageMessageLength) }}
          </div>
          <div class="text-body-2 text-grey">Avg. Message Length</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="outlined" class="text-center pa-4">
          <v-icon size="40" color="warning" class="mb-2">
            mdi-calendar-month
          </v-icon>
          <div class="text-h4 font-weight-bold">{{ monthlyContactsCount }}</div>
          <div class="text-body-2 text-grey">This Month</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Contacts by Domain -->
    <v-divider class="my-4" />

    <v-card-subtitle class="text-h6 mb-3">
      <v-icon class="mr-2">mdi-domain</v-icon>
      Top Email Domains
    </v-card-subtitle>

    <v-list v-if="topDomains.length > 0">
      <v-list-item
        v-for="domain in topDomains"
        :key="domain.domain"
        class="px-0"
      >
        <template #prepend>
          <v-avatar size="32" color="primary">
            <v-icon>mdi-web</v-icon>
          </v-avatar>
        </template>

        <v-list-item-title>{{ domain.domain }}</v-list-item-title>
        <v-list-item-subtitle>{{ domain.count }} contacts</v-list-item-subtitle>

        <template #append>
          <v-chip size="small" color="primary">
            {{ Math.round((domain.count / stats.total) * 100) }}%
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <!-- Contact Timeline -->
    <v-divider class="my-4" />

    <v-card-subtitle class="text-h6 mb-3">
      <v-icon class="mr-2">mdi-timeline</v-icon>
      Recent Activity
    </v-card-subtitle>

    <v-timeline density="compact" v-if="recentContacts.length > 0">
      <v-timeline-item
        v-for="contact in recentContacts"
        :key="contact.id"
        size="small"
        color="primary"
      >
        <template #opposite>
          <span class="text-caption text-grey">
            {{ formatRelativeTime(contact.createdAt) }}
          </span>
        </template>

        <v-card variant="outlined" class="pa-3">
          <div class="text-subtitle-2">{{ contact.name }}</div>
          <div class="text-caption text-grey mb-1">{{ contact.email }}</div>
          <div class="text-body-2">
            {{ truncateMessage(contact.message, 80) }}
          </div>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useContactStore } from "@/stores/contact";
import contactUtils from "@/utils/contactUtils";

const contactStore = useContactStore();
const { contacts, loading } = storeToRefs(contactStore);
const { getContactsStats } = contactStore;

// Create memoized stats calculation for performance
const getMemoizedStats = contactUtils.performance.createMemoizedStats();

// Computed statistics using utility functions
const stats = computed(() => {
  if (!contacts.value?.length) return null;
  return getMemoizedStats(contacts.value);
});

const monthlyContactsCount = computed(() => {
  const currentMonth = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }`;
  return stats.value?.byMonth?.[currentMonth] || 0;
});

const topDomains = computed(() => {
  if (!contacts.value?.length) return [];
  return stats.value?.topDomains || [];
});

const recentContacts = computed(() => {
  if (!contacts.value?.length) return [];
  return stats.value?.recentContacts || [];
});

// Utility methods using contactUtils
const truncateMessage = (message, length = 80) => {
  return contactUtils.transform.smartTruncate(message, length);
};

const formatRelativeTime = (dateString) => {
  return contactUtils.transform.formatRelativeTime(dateString);
};
</script>
