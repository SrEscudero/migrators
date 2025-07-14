// front-migrators/src/composables/useTheme.js

import { ref, watch, onMounted } from 'vue';

// El estado del tema se declara fuera para que sea un singleton (compartido)
const theme = ref(localStorage.getItem('theme') || 'light');

export function useTheme() {
  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', newTheme);
    theme.value = newTheme;
  };

  const toggleTheme = () => {
    applyTheme(theme.value === 'light' ? 'dark' : 'light');
  };

  // Aplica el tema guardado cuando el composable se usa por primera vez
  onMounted(() => {
    applyTheme(theme.value);
  });

  // Observa cambios en la referencia del tema (útil si se cambia desde otro lugar)
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    toggleTheme,
  };
}