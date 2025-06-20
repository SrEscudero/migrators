<template>
    <div class="cliente-registro-modal">
      <!-- Overlay -->
      <div class="modal-overlay" @click.self="$emit('cancelar')"></div>
  
      <!-- Contenido del modal -->
      <div class="modal-content">
        <!-- Header del modal -->
        <div class="modal-header">
          <h3>{{ esEdicion ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <button class="btn-close" @click="$emit('cancelar')">
            <i class="fas fa-times"></i>
          </button>
        </div>
  
        <!-- Cuerpo del modal -->
        <div class="modal-body">
          <form @submit.prevent="guardarCliente">
            <!-- Sección de Información Personal -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-user-circle"></i> Información Personal
              </h4>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="nombre">Nombre completo*</label>
                    <input
                      id="nombre"
                      v-model="cliente.nombre"
                      type="text"
                      class="form-control"
                      required
                      placeholder="Ej: Juan Pérez Gómez"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="nacionalidad">Nacionalidad*</label>
                    <select
                      id="nacionalidad"
                      v-model="cliente.nacionalidad"
                      class="form-control"
                      required
                    >
                      <option value="">Seleccione una nacionalidad</option>
                      <option v-for="pais in paises" :key="pais" :value="pais">
                        {{ pais }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Sección de Datos de Contacto -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-address-book"></i> Datos de Contacto
              </h4>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      v-model="cliente.telefono"
                      type="text"
                      class="form-control"
                      placeholder="Ej: +52 123 456 7890"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="email">Correo electrónico</label>
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
            </div>
  
            <!-- Botones de acción -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="$emit('cancelar')">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ esEdicion ? 'Actualizar Cliente' : 'Registrar Cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
  /* Estilos base */
  .cliente-registro-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    position: relative;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  
  .form-section {
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 1.2rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  
  .section-title i {
    margin-right: 10px;
  }
  
  .row {
    display: flex;
    gap: 20px;
  }
  
  .col-md-6 {
    flex: 1;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: #555;
  }
  
  .form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: #fff;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: #fff;
  }
  </style>