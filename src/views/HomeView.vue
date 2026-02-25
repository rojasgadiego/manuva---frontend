<template>
  <div class="home-container">
    <NavBar />
    <HeroSection />
    <AboutSection />
    <!-- <ServicesSection />
    <CatalogSection />
    <GallerySection />
     -->
    <MapSection />
    <FooterSection />
  </div>
</template>

<script>
import NavBar from '@/components/Home/Navigation/NavBar.vue'
import HeroSection from '@/components/Home/Sections/HeroSection.vue'
import AboutSection from '@/components/Home/Sections/AboutSection.vue'
// import ServicesSection from '@/components/Home/Sections/ServicesSection.vue'
// import CatalogSection from '@/components/Home/Sections/CatalogSection.vue'
// import GallerySection from '@/components/Home/Sections/GallerySection.vue'
import MapSection from '@/components/Home/Sections/MapSection.vue'
import FooterSection from '@/components/Home/Sections/FooterSection.vue'

export default {
  name: 'HomeView',
  components: {
    NavBar,
    HeroSection,
    AboutSection,
    // ServicesSection,
    // CatalogSection,
    // GallerySection,
    MapSection,
    FooterSection
  }
}
</script>

<style scoped>
.home-container {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Animaciones globales para navegación */
:global(.section-highlight) {
  animation: sectionHighlight 1s ease;
}

@keyframes sectionHighlight {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(116, 198, 157, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

/* Smooth scroll para todo el documento */
:global(html) {
  scroll-behavior: smooth;
}

/* Estilos para transiciones suaves */
:global(section) {
  transition: background-color 0.5s ease;
}
</style>