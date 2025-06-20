import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "leaflet/dist/leaflet.css";
import 'flag-icon-css/css/flag-icons.css'
import '@fortawesome/fontawesome-free/css/all.css';
import vClickOutside from 'v-click-outside';
import SweetAlertPlugin from "./plugins/sweetalert"; // Importa el plugin
import VueApexCharts from 'vue3-apexcharts'; 
import router from './router';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia(); 

app.use(pinia);
app.use(VueApexCharts); // Registra o componente <apexchart> globalmente
app.use(vClickOutside);
app.use(router);
app.use(SweetAlertPlugin);
app.mount('#app');
