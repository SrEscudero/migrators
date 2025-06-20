<template>
  <div class="gestion-clientes-container">
    <ClientesView
      :clientes="listaClientes"
      :loading="isLoading"
      @nuevo-cliente="handleNuevoCliente"
      @editar-cliente="handleEditarCliente"
    />
    
    <transition name="fade">
      <ClienteRegistro
        v-if="mostrarFormulario"
        :cliente-inicial="clienteSeleccionado"
        :es-edicion="esEdicion"
        @guardar="handleGuardarCliente"
        @cancelar="handleCerrarFormulario"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

// Importa los componentes y servicios necesarios
import ClientesView from '@/components/AdminDashboard/ClientesView.vue';
import ClienteRegistro from '@/components/AdminDashboard/ClienteRegistro.vue';
import { getClientes } from '@/services/clienteService.js'; // Asegúrate que esta ruta es correcta

// --- ESTADO ---
const listaClientes = ref([]); // 
const isLoading = ref(false); // 
const mostrarFormulario = ref(false); // 
const clienteSeleccionado = ref(null); // 
const esEdicion = ref(false); // 

// --- MÉTODOS ---
const fetchClientes = async () => { // 
  isLoading.value = true;
  try {
    listaClientes.value = await getClientes(); // 
  } catch (error) {
    Swal.fire("Error", `No se pudieron cargar los clientes: ${error.message}`, "error"); // 
    listaClientes.value = []; // 
  } finally {
    isLoading.value = false; // 
  }
};

const handleNuevoCliente = () => { // 
  clienteSeleccionado.value = null;
  esEdicion.value = false;
  mostrarFormulario.value = true;
};

const handleEditarCliente = (cliente) => { // 
  clienteSeleccionado.value = { ...cliente };
  esEdicion.value = true;
  mostrarFormulario.value = true;
};

const handleGuardarCliente = async (clienteData) => { // 
  console.log("Guardando cliente (lógica simulada):", clienteData);
  // Aquí iría la lógica real para llamar al servicio de API para guardar/editar
  Swal.fire("Éxito", `Cliente ${esEdicion.value ? 'actualizado' : 'registrado'} (simulado).`, "success"); // 
  mostrarFormulario.value = false;
  await fetchClientes(); // Refrescar la lista de clientes
};

const handleCerrarFormulario = () => { // 
  mostrarFormulario.value = false;
};

// --- HOOK DE CICLO DE VIDA ---
onMounted(fetchClientes); // 
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>