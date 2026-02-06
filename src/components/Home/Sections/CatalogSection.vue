<template>
  <section id="catalogo" class="section">
    <div class="container">
      <h2>{{ sectionTitle }}</h2>
      <div class="catalog-grid">
        <CatalogCard
          v-for="item in catalogItems"
          :key="item.id"
          :icon="item.icon"
          :name="item.name"
          :description="item.description"
          :price="item.price"
        />
      </div>
    </div>
  </section>
</template>

<script>
import CatalogCard from '../Cards/CatalogCard.vue'

export default {
  name: 'CatalogSection',
  components: {
    CatalogCard
  },
  data() {
    return {
      sectionTitle: 'Nuestro Catálogo',
      catalogItems: [
        {
          id: 1,
          name: 'Ramo Clásico',
          description: 'Hermoso ramo de rosas rojas',
          price: '25.000',
          icon: '🌹'
        },
        {
          id: 2,
          name: 'Arreglo Primaveral',
          description: 'Flores mixtas de temporada',
          price: '35.000',
          icon: '🌷'
        },
        {
          id: 3,
          name: 'Centro de Mesa',
          description: 'Elegante centro para eventos',
          price: '45.000',
          icon: '🌺'
        },
        {
          id: 4,
          name: 'Ramo de Novia',
          description: 'Diseño especial para tu gran día',
          price: '85.000',
          icon: '👰'
        }
      ]
    }
  }
}
</script>

<style scoped>
.section {
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2d6a4f;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
}
</style>