<template>
  <section id="galeria" class="section bg-light">
    <div class="container">
      <h2 class="section-title" :class="{ 'animate-in': titleVisible }" ref="title">
        {{ sectionTitle }}
      </h2>
      <p class="section-subtitle" :class="{ 'animate-in': titleVisible }">
        Descubre nuestros trabajos más destacados
      </p>
      <div class="gallery-grid" ref="gallery">
        <GalleryItem
          v-for="(icon, index) in galleryIcons"
          :key="index"
          :icon="icon"
        />
      </div>
    </div>
  </section>
</template>

<script>
import GalleryItem from '../Cards/GalleryItem.vue'

export default {
  name: 'GallerySection',
  components: {
    GalleryItem
  },
  data() {
    return {
      sectionTitle: 'Galería',
      titleVisible: false,
      galleryIcons: ['🌻', '🌸', '🌺', '🌷', '🌹', '💐', '🌼', '🌿', '🍀']
    }
  },
  mounted() {
    this.observeTitleVisibility()
  },
  methods: {
    observeTitleVisibility() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                this.titleVisible = true
              }, 200)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.3 }
      )
      
      if (this.$refs.title) {
        observer.observe(this.$refs.title)
      }
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

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d6a4f;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.section-title.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s;
}

.section-subtitle.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
}

/* Efecto de hover para toda la galería */
.gallery-grid:hover .gallery-item:not(:hover) {
  opacity: 0.7;
  transform: scale(0.95);
}
</style>