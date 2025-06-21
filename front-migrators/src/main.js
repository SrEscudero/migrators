import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/scss/main.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "leaflet/dist/leaflet.css";
import 'flag-icon-css/css/flag-icons.css'
import '@fortawesome/fontawesome-free/css/all.css';
import vClickOutside from 'v-click-outside';
import SweetAlertPlugin from "./plugins/sweetalert"; 
import VueApexCharts from 'vue3-apexcharts'; 
import router from './router';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia(); 

app.use(pinia);
app.use(VueApexCharts); 
app.use(vClickOutside);
app.use(router);
app.use(SweetAlertPlugin);
app.mount('#app');
