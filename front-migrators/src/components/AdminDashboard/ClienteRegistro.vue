<template>
  <form @submit.prevent="$emit('guardar', cliente)">
    <div class="form-section">
      <h4 class="section-title">
        <i class="fas fa-user-circle"></i> Información Personal
      </h4>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="nombre" class="form-label">Nombre completo*</label>
          <input
            id="nombre"
            v-model="cliente.nombre"
            type="text"
            class="form-control"
            required
            placeholder="Ej: Juan Pérez Gómez"
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="nacionalidad" class="form-label">Nacionalidad*</label>
          <select
            id="nacionalidad"
            v-model="cliente.nacionalidad"
            class="form-select"
            required
          >
            <option value="" disabled>Seleccione una nacionalidad</option>
            <option v-for="pais in paises" :key="pais" :value="pais">
              {{ pais }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4 class="section-title">
        <i class="fas fa-address-book"></i> Datos de Contacto
      </h4>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="telefono" class="form-label">Teléfono</label>
          <input
            id="telefono"
            v-model="cliente.telefono"
            type="tel"
            class="form-control"
            placeholder="Ej: +52 123 456 7890"
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="email" class="form-label">Correo electrónico</label>
          <input
            id="email"
            v-model="cliente.email"
            type="email"
            class="form-control"
            placeholder="Ej: juan.perez@example.com"
          />
        </div>
      </div>
    </div>
    
    <button type="submit" class="d-none"></button>

  </form>
</template>
  
  <script>
  import { ref, watch } from "vue";
  
  export default {
    name: "ClienteRegistroNuevo",
    props: {
      clienteInicial: {
        type: Object,
        default: () => ({}),
      },
      esEdicion: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["guardar", "cancelar"],
    setup(props, { emit }) {
      // Estados reactivos
      const cliente = ref({
        nombre: "",
        nacionalidad: "",
        telefono: "",
        email: "",
      });
  
      // Lista de países
      const paises = ref(["México", "Argentina", "Brasil", "Chile"]);
  
      // Observar cambios en clienteInicial para edición
      watch(
        () => props.clienteInicial,
        (nuevoValor) => {
          if (props.esEdicion && nuevoValor) {
            cliente.value = { ...nuevoValor };
          } else {
            cliente.value = {
              nombre: "",
              nacionalidad: "",
              telefono: "",
              email: "",
            };
          }
        },
        { immediate: true }
      );
  
      // Método para guardar el cliente
      const guardarCliente = () => {
        if (!cliente.value.nombre || !cliente.value.nacionalidad) {
          alert("Por favor, complete todos los campos obligatorios.");
          return;
        }
        emit("guardar", cliente.value);
      };
  
      return {
        cliente,
        paises,
        guardarCliente,
      };
    },
  };
  </script>
  
<style scoped>
/* LOS ESTILOS DEL MODAL SE HAN ELIMINADO. AHORA SOLO QUEDAN LOS DEL FORMULARIO */
.form-section {
  margin-bottom: 1.5rem;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #34495e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}
</style>