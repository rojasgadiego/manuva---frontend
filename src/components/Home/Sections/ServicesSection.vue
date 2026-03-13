<template>
  <section id="planes" class="section bg-light" ref="sectionRef">
    <div class="container">
      <h2 class="section-title" :class="{ 'animate-in': titleVisible }">Elige tu Duración</h2>
      <div class="plans-grid" :class="{ 'animate-in': gridVisible }" ref="gridRef">
        <div 
          v-for="(plan, index) in subscriptionPlans" 
          :key="plan.id"
          class="plan-card" 
          :class="{ 'best-value': plan.bestValue }"
          :data-index="index"
        >
          <div class="plan-header">
            <div class="plan-icon">{{ plan.icon }}</div>
            <h3 class="plan-title">{{ plan.title }}</h3>
          </div>
          
          <p class="plan-description">{{ plan.description }}</p>
          
          <div class="plan-price">
            <span class="price-amount">{{ plan.price }}</span>
            <span class="price-duration">{{ plan.durationPrice }}</span>
          </div>
          
          <ul class="plan-features">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex">
              <span class="feature-check">✓</span>
              {{ feature }}
            </li>
          </ul>
          
          <button class="cta-button">
            {{ plan.bestValue ? '¡MEJOR VALOR!' : 'Suscribirme' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const sectionRef = ref(null)
const gridRef = ref(null)
const titleVisible = ref(false)
const gridVisible = ref(false)

const subscriptionPlans = [
  {
    id: 1,
    icon: '🗓️',
    title: '1 Mes',
    description: 'Prueba el club por un mes completo.',
    price: '$17.000',
    durationPrice: '1 mes • $17.000/mes',
    features: [
      'Acceso ilimitado a salidas',
      'Equipo completo incluido',
      'Clases grupales',
      'Comunidad del club'
    ],
    duration: '1 mes',
    bestValue: false,
    discount: 0
  },
  {
    id: 2,
    icon: '📅',
    title: '4 Meses',
    description: 'Compromiso trimestral con 10% descuento.',
    price: '$61.200',
    durationPrice: '4 meses • $15.300/mes',
    features: [
      'Todo del plan mensual',
      '10% descuento ($61.200 total)',
      'Prioridad en inscripciones',
      '1 clase privada gratis'
    ],
    duration: '4 meses',
    bestValue: true,
    discount: 10
  },
  {
    id: 3,
    icon: '📆',
    title: '12 Meses',
    description: 'Ahorra 20% y vive el club todo el año.',
    price: '$163.200',
    durationPrice: '12 meses • $13.600/mes',
    features: [
      'Todo del plan trimestral',
      '20% descuento ($163.200 total)',
      'Acceso a eventos exclusivos',
      '2 clases privadas',
      'Descuentos en tienda 10%'
    ],
    duration: '12 meses',
    bestValue: false,
    discount: 20
  }
]

onMounted(() => {
  observeVisibility()
})

const observeVisibility = () => {
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  }

  // Título
  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        titleVisible.value = true
        titleObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Grid de planes
  const gridObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gridVisible.value = true
        gridObserver.unobserve(entry.target)
        
        // Animar cards individualmente después de 200ms
        nextTick(() => {
          animateCards()
        })
      }
    })
  }, observerOptions)

  if (sectionRef.value?.querySelector('.section-title')) {
    titleObserver.observe(sectionRef.value.querySelector('.section-title'))
  }
  
  if (gridRef.value) {
    gridObserver.observe(gridRef.value)
  }
}

const animateCards = () => {
  const cards = gridRef.value?.querySelectorAll('.plan-card')
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1'
      card.style.transform = 'translateY(0) scale(1)'
    }, index * 200)
  })
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

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2d6a4f;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.section-title.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  justify-items: center;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s ease;
}

.plans-grid.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.plan-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-width: 320px;
  text-align: center;
  position: relative;
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

.plan-card:hover {
  transform: translateY(-15px) scale(1.02) !important;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
}

.best-value {
  border: 3px solid #2d6a4f;
}

.best-value::before {
  content: 'POPULAR';
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d6a4f;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.plan-header {
  margin-bottom: 1rem;
}

.plan-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.plan-title {
  font-size: 1.8rem;
  color: #2d6a4f;
  margin: 0 0 1rem 0;
}

.plan-description {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.plan-price {
  margin-bottom: 2rem;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d6a4f;
  display: block;
}

.price-duration {
  color: #888;
  font-size: 1rem;
  font-weight: 500;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: left;
}

.plan-features li {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.feature-check {
  color: #2d6a4f;
  font-weight: bold;
  margin-right: 0.8rem;
  font-size: 1.2rem;
  min-width: 20px;
}

.cta-button {
  background: linear-gradient(135deg, #2d6a4f, #4a9c7a);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(45, 106, 79, 0.3);
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .plan-card {
    max-width: 100%;
  }
}
</style>
