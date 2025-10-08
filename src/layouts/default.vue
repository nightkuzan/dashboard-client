<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="4" height="64">
      <v-app-bar-title class="d-flex align-center">
        <v-icon class="mr-2" size="32">mdi-view-dashboard</v-icon>
        <span class="text-h5 font-weight-bold">Contact Dashboard</span>
      </v-app-bar-title>

      <v-spacer />
      <!-- Theme Toggle -->
      <v-btn icon @click="toggleTheme" class="mr-2">
        <v-icon>{{
          isDark ? "mdi-weather-sunny" : "mdi-weather-night"
        }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const isDark = ref(false);

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
  isDark.value = theme.global.current.value.dark;
};

onMounted(() => {
  isDark.value = theme.global.current.value.dark;
});
</script>
