<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>{{ companyInfo.name }}</h3>
          <p>{{ companyInfo.tagline }}</p>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>📞 {{ contactInfo.phone }}</p>
          <p>📧 {{ contactInfo.email }}</p>
        </div>
        <div class="footer-section">
          <h4>Horarios</h4>
          <p v-for="(schedule, index) in schedules" :key="index">
            {{ schedule }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterSection',
  data() {
    return {
      companyInfo: {
        name: '🌸 Florería Bella',
        tagline: 'Creando momentos especiales desde 2008'
      },
      contactInfo: {
        phone: '+56 9 1234 5678',
        email: 'info@floreriabella.cl'
      },
      schedules: [
        'Lunes - Sábado: 9:00 - 19:00',
        'Domingo: 10:00 - 16:00'
      ]
    }
  }
}
</script>

<style scoped>
.footer {
  background: #2d6a4f;
  color: white;
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
}

.footer-section p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>