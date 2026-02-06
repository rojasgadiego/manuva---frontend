<template>
  <div class="service-card" :class="{ 'animate-in': isVisible }" ref="card">
    <div class="service-icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'ServiceCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isVisible: false
    }
  },
  mounted() {
    this.observeVisibility()
  },
  methods: {
    observeVisibility() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                this.isVisible = true
              }, Math.random() * 200) // Delay aleatorio para efecto escalonado
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1 }
      )
      
      if (this.$refs.card) {
        observer.observe(this.$refs.card)
      }
    }
  }
}
</script>

<style scoped>
.service-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: translateY(30px);
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(116, 198, 157, 0.1), transparent);
  transition: left 0.6s;
}

.service-card:hover::before {
  left: 100%;
}

.service-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1) rotate(5deg);
}

.service-card h3 {
  color: #2d6a4f;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.service-card:hover h3 {
  color: #52b788;
}

.service-card p {
  color: #666;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.service-card:hover p {
  color: #555;
}
</style>