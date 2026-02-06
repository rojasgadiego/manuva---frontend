<template>
  <section id="quienes-somos" class="section">
    <div class="container">
      <h2>{{ sectionTitle }}</h2>
      <div class="about-content">
        <div class="about-text">
          <p v-for="(paragraph, index) in paragraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
        <div class="about-image">
          <div class="image-placeholder">🌺</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutSection',
  data() {
    return {
      sectionTitle: 'Quiénes Somos',
      paragraphs: [
        'Somos una florería familiar con más de 15 años de experiencia creando momentos especiales a través de la belleza de las flores. Nos especializamos en arreglos personalizados para bodas, eventos corporativos y ocasiones especiales.',
        'Nuestro equipo de floristas profesionales selecciona cuidadosamente cada flor para garantizar la más alta calidad y frescura en todos nuestros productos.'
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

.about-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.about-text p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #555;
}

.about-image {
  text-align: center;
}

.image-placeholder {
  font-size: 8rem;
  background: linear-gradient(135deg, #e8f5e8, #d3f4d3);
  border-radius: 20px;
  padding: 2rem;
  display: inline-block;
}

/* Responsive */
@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .image-placeholder {
    font-size: 4rem;
  }
}
</style>