// backend-migrators/jest.config.js
export default {
  testEnvironment: 'node',
  transform: {}, // Necesario para que Jest no intente transformar ES Modules
  // Opcional: Ignorar archivos que no son de prueba
  testPathIgnorePatterns: ["/node_modules/", "/front-migrators/"],
};