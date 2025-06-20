<template>
  <footer class="footer bg-white pt-5">
    <!-- Contenido principal -->
    <div class="container">
      <div class="row g-4 g-lg-5">
        <!-- Logo y descripción -->
        <div class="col-lg-4">
          <div class="footer-brand mb-4">
            <router-link to="/" class="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 text-decoration-none">
              <img src="../../assets/midia/icons/logo_trans.png" alt="Migrators Logo" class="logo-img" width="150">
            </router-link>
          </div>
          <p class="text-muted mb-4">
            Plataforma de orientación para migrantes venezolanos en Brasil, facilitando procesos de documentación e integración.
          </p>
          <div class="newsletter">
            <h4 class="h6 mb-3">Suscríbete a nuestro boletín</h4>
            <div class="input-group">
              <input type="email" class="form-control" placeholder="Tu correo electrónico" aria-label="Email">
              <button class="btn btn-primary" type="button">Suscribir</button>
            </div>
          </div>
        </div>

        <!-- Enlaces rápidos -->
        <div class="col-6 col-lg-2">
          <h3 class="h5 mb-4 text-uppercase fw-bold">Navegación</h3>
          <ul class="list-unstyled">
            <li class="mb-2"><router-link to="/" class="text-decoration-none link-secondary">Inicio</router-link></li>
            <li class="mb-2"><router-link to="/servicios" class="text-decoration-none link-secondary">Servicios</router-link></li>
            <li class="mb-2"><router-link to="/mapa" class="text-decoration-none link-secondary">Mapa</router-link></li>
            <li class="mb-2"><router-link to="/faqs" class="text-decoration-none link-secondary">FAQs</router-link></li>
            <li class="mb-2"><router-link to="/contacto" class="text-decoration-none link-secondary">Contacto</router-link></li>
          </ul>
        </div>

        <!-- Enlaces legales -->
        <div class="col-6 col-lg-2">
          <h3 class="h5 mb-4 text-uppercase fw-bold">Legal</h3>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="#" class="text-decoration-none link-secondary">Términos de uso</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none link-secondary">Política de privacidad</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none link-secondary">Cookies</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none link-secondary">Aviso legal</a></li>
          </ul>
        </div>

        <!-- Contacto y redes -->
        <div class="col-lg-4">
          <h3 class="h5 mb-4 text-uppercase fw-bold">Contacto</h3>
          <ul class="list-unstyled">
            <li class="mb-3 d-flex align-items-start">
              <i class="bi bi-geo-alt-fill text-primary me-2"></i>
              <span>Brasil</span>
            </li>
            <li class="mb-3 d-flex align-items-center">
              <i class="bi bi-envelope-fill text-primary me-2"></i>
              <a href="mailto:info@migrators.org" class="text-decoration-none link-secondary">info@migrators.org</a>
            </li>
            <li class="mb-3 d-flex align-items-center">
              <i class="bi bi-telephone-fill text-primary me-2"></i>
              <a href="tel:+551112345678" class="text-decoration-none link-secondary">+55 11 1234-5678</a>
            </li>
          </ul>
          
          <div class="social-media mt-4">
            <h4 class="h6 mb-3">Síguenos</h4>
            <div class="d-flex gap-3">
              <a href="#" class="social-icon" aria-label="Facebook">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="social-icon" aria-label="Twitter">
                <i class="bi bi-twitter-x"></i>
              </a>
              <a href="#" class="social-icon" aria-label="Instagram">
                <i class="bi bi-instagram"></i>
              </a>
              <a href="#" class="social-icon" aria-label="LinkedIn">
                <i class="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <hr class="my-5">

      <!-- Footer inferior -->
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0 text-muted small">
            &copy; 2025 Migrators. Todos los derechos reservados.
          </p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <div class="language-selector">
            <select class="form-select form-select-sm d-inline-block w-auto">
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>

<style scoped>
.footer {
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.05);
}

.logo-img {
  transition: transform 0.3s ease;
}

.brand-text {
  color: var(--bs-primary);
  transition: color 0.3s ease;
}

.brand-text:hover {
  color: var(--bs-primary-dark);
}

.link-secondary {
  color: var(--bs-gray-600);
  transition: all 0.2s ease;
  position: relative;
}

.link-secondary:hover {
  color: var(--bs-primary);
  padding-left: 5px;
}

.link-secondary::before {
  content: "";
  position: absolute;
  width: 0;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: var(--bs-primary);
  transition: width 0.3s ease;
}

.link-secondary:hover::before {
  width: 100%;
}

.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bs-gray-200);
  color: var(--bs-gray-700);
  transition: all 0.3s ease;
}

.social-icon:hover {
  background-color: var(--bs-primary);
  color: white;
  transform: translateY(-3px);
}

.newsletter .form-control {
  border-color: var(--bs-gray-300);
}

.newsletter .btn {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

@media (max-width: 768px) {
  .footer {
    text-align: center;
  }
  
  .link-secondary:hover {
    padding-left: 0;
  }
  
  .link-secondary::before {
    display: none;
  }
  
  .d-flex {
    justify-content: center;
  }
}
</style>