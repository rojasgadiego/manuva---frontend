<template>
  <div class="catalog-item" :class="{ 'animate-in': isVisible }" ref="card">
    <div class="catalog-image">{{ icon }}</div>
    <div class="catalog-content">
      <h3>{{ name }}</h3>
      <p>{{ description }}</p>
      <span class="price">${{ price }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CatalogCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
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
              }, Math.random() * 300) // Delay aleatorio para efecto escalonado
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
.catalog-item {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: translateY(30px);
}

.catalog-item.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.catalog-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.catalog-image {
  font-size: 4rem;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #e8f5e8, #d3f4d3);
  transition: all 0.3s ease;
}

.catalog-item:hover .catalog-image {
  background: linear-gradient(135deg, #d3f4d3, #c8e6c8);
  transform: scale(1.05);
}

.catalog-content {
  padding: 0 1.5rem 1.5rem;
}

.catalog-item h3 {
  color: #2d6a4f;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.catalog-item:hover h3 {
  color: #52b788;
}

.catalog-item p {
  color: #666;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.catalog-item:hover p {
  color: #555;
}

.price {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  color: #52b788;
  background: #f8f9fa;
  padding: 1rem;
  margin: 0 -1.5rem -1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.catalog-item:hover .price {
  background: #52b788;
  color: white;
}
</style>