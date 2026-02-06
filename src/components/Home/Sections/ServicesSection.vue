<template>
  <section id="servicios" class="section bg-light">
    <div class="container">
      <h2>{{ sectionTitle }}</h2>
      <div class="services-grid">
        <ServiceCard 
          v-for="service in services" 
          :key="service.id"
          :icon="service.icon"
          :title="service.title"
          :description="service.description"
        />
      </div>
    </div>
  </section>
</template>

<script>
import ServiceCard from '../Cards/ServiceCard.vue'

export default {
  name: 'ServicesSection',
  components: {
    ServiceCard
  },
  data() {
    return {
      sectionTitle: 'Nuestros Servicios',
      services: [
        {
          id: 1,
          icon: '💐',
          title: 'Arreglos Personalizados',
          description: 'Creamos arreglos únicos según tus gustos y ocasión especial.'
        },
        {
          id: 2,
          icon: '💒',
          title: 'Bodas y Eventos',
          description: 'Decoración floral completa para tu día más especial.'
        },
        {
          id: 3,
          icon: '🚚',
          title: 'Entrega a Domicilio',
          description: 'Llevamos tus flores frescas directamente a tu destino.'
        },
        {
          id: 4,
          icon: '🎁',
          title: 'Regalos Corporativos',
          description: 'Arreglos elegantes para eventos empresariales y obsequios.'
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

.bg-light {
  background-color: #f8f9fa;
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

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>