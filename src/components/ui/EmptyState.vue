<template>
  <div class="empty" role="status">
    <span class="empty__icono" aria-hidden="true">
      <component :is="icono" :size="26" />
    </span>
    <p class="empty__titulo">{{ titulo }}</p>
    <p v-if="texto" class="empty__texto">{{ texto }}</p>
    <div v-if="$slots.default" class="empty__acciones"><slot /></div>
  </div>
</template>

<script>
import { Inbox } from 'lucide-vue-next'

/**
 * Estado vacío con una acción sugerida. Uso:
 *   <EmptyState titulo="Aún no tienes salidas" texto="…" :icono="CalendarDays">
 *     <router-link to="/agenda" class="ui-btn ui-btn--primary">Reservar</router-link>
 *   </EmptyState>
 */
export default {
  name: 'EmptyState',
  props: {
    titulo: { type: String, required: true },
    texto:  { type: String, default: '' },
    icono:  { type: [Object, Function], default: () => Inbox },
  },
}
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 36px 20px;
}
.empty__icono {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--ui-cyan-dim);
  color: var(--ui-cyan);
  margin-bottom: 6px;
}
.empty__titulo {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.98rem;
  color: var(--text-primary);
}
.empty__texto {
  max-width: 380px;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--text-secondary);
}
.empty__acciones { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
</style>
