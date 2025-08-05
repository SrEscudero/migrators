import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'leaflet/dist/leaflet.css';
import './assets/scss/main.scss'; // Este importa el CSS principal
import { createHead } from '@vueuse/head'; // <-- 1. IMPORTA createHead
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "leaflet/dist/leaflet.css";
import 'flag-icons/css/flag-icons.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import vClickOutside from 'v-click-outside';
import SweetAlertPlugin from "./plugins/sweetalert";
import VueApexCharts from 'vue3-apexcharts';
import router from './router';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();
const head = createHead(); // <-- 2. CREA la instancia de head

app.use(head); // <-- 3. USA el plugin en tu aplicación
app.use(pinia);
app.use(VueApexCharts);
app.use(vClickOutside);
app.use(router);
app.use(SweetAlertPlugin);
app.mount('#app');