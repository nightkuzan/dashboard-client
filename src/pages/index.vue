<template>
  <v-container class="pa-4" fluid>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="text-center">
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            Contact Dashboard
          </h1>
          <p class="text-h6 text-grey-darken-1">
            Submit and manage contact messages
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Contact Form Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <ContactForm />
      </v-col>
    </v-row>

    <!-- Contact List Section -->
    <v-row>
      <v-col cols="12">
        <ContactListServerPagination />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import ContactForm from "@/components/ContactForm.vue";
import ContactListServerPagination from "@/components/ContactListServerPagination.vue";
</script>
