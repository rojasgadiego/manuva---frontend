<template>
  <div class="gallery-item" :class="{ 'animate-in': isVisible }" ref="item">
    <div class="gallery-placeholder">{{ icon }}</div>
    <div class="gallery-overlay">
      <span class="view-text">Ver</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GalleryItem',
  props: {
    icon: {
      type: String,
      default: '🌻'
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
              }, Math.random() * 400) // Delay aleatorio para efecto escalonado
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.2 }
      )
      
      if (this.$refs.item) {
        observer.observe(this.$refs.item)
      }
    }
  }
}
</script>

<style scoped>
.gallery-item {
  aspect-ratio: 1;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f5e8, #d3f4d3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  position: relative;
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.gallery-item.animate-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.gallery-item:hover {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  background: linear-gradient(135deg, #d3f4d3, #c8e6c8);
}

.gallery-placeholder {
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.gallery-item:hover .gallery-placeholder {
  transform: scale(1.2) rotate(-2deg);
  filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 106, 79, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.view-text {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.gallery-item:hover .view-text {
  transform: translateY(0);
}

/* Efecto de pulso sutil */
.gallery-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(116, 198, 157, 0.3) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: all 0.6s ease;
}

.gallery-item:hover::before {
  opacity: 1;
  transform: scale(1);
}

/* Animación adicional al hacer click */
.gallery-item:active {
  transform: scale(0.95);
}
</style>