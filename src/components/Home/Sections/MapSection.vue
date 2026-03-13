<template>
  <section id="contacto" class="map-section">
    <div class="container">

      <!-- Header -->
      <div class="section-header" :class="{ 'animate-in': titleVisible }" ref="title">
        <span class="section-tag">Contacto & Ubicación</span>
        <h2>Encuéntranos en Coquimbo</h2>
        <p class="section-subtitle">Visítanos en nuestra sede, escríbenos o llámanos</p>
      </div>

      <!-- Grid principal -->
      <div class="map-container" :class="{ 'animate-in': mapVisible }" ref="mapContainer">

        <!-- Panel izquierdo -->
        <div class="map-info">

          <!-- Header del club -->
          <div class="info-header">
            <div class="info-logo">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="11" cy="11" rx="9" ry="5.5" fill="rgba(29,120,80,0.15)" stroke="#1d7850" stroke-width="1.5" transform="rotate(-45 11 11)"/>
                <line x1="16" y1="16" x2="32" y2="32" stroke="#1d7850" stroke-width="2" stroke-linecap="round"/>
                <circle cx="33" cy="33" r="2.5" fill="#0d4a5c" opacity="0.6"/>
              </svg>
              <span>Club Manuva'a</span>
            </div>
            <span class="status-badge">
              <span class="badge-dot"></span>
              Abierto
            </span>
          </div>

          <div class="info-details">

            <!-- Dirección -->
            <div class="detail-item">
              <div class="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="detail-content">
                <strong>Dirección</strong>
                <p>{{ storeInfo.address }}</p>
              </div>
            </div>

            <!-- Distancia desde ubicación del usuario -->
            <div v-if="userLocation && distance" class="detail-item detail-distance">
              <div class="detail-icon accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="detail-content">
                <strong>Desde tu ubicación</strong>
                <p class="distance-val">{{ distance }} km · aprox. {{ travelTime }} min en auto</p>
              </div>
            </div>

            <!-- Botón geolocalización -->
            <div v-else-if="!userLocation && locationPermission !== 'denied'" class="detail-item">
              <div class="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                </svg>
              </div>
              <div class="detail-content">
                <strong>Calcular distancia</strong>
                <button class="location-btn" @click="requestLocation" :disabled="isCalculatingDistance">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ isCalculatingDistance ? 'Obteniendo ubicación…' : 'Usar mi ubicación' }}
                </button>
              </div>
            </div>

            <!-- Teléfono -->
            <div class="detail-item">
              <div class="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="detail-content">
                <strong>Teléfono</strong>
                <p>{{ storeInfo.phone }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="detail-item">
              <div class="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="detail-content">
                <strong>Email</strong>
                <p>{{ storeInfo.email }}</p>
              </div>
            </div>

            <!-- Horarios -->
            <div class="detail-item">
              <div class="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="detail-content">
                <strong>Horarios</strong>
                <p v-for="(schedule, index) in storeInfo.schedules" :key="index">{{ schedule }}</p>
              </div>
            </div>

          </div>

          <!-- Botones de acción -->
          <div class="action-buttons">
            <button class="btn-primary" @click="openDirections">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              {{ userLocation ? 'Ruta optimizada' : 'Cómo llegar' }}
            </button>
            <button class="btn-secondary" @click="makeCall">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Llamar
            </button>
          </div>

        </div>

        <!-- Mapa -->
        <div class="map-wrapper">
          <div v-if="mapType === 'google'" class="google-map">
            <iframe
              :src="googleMapsEmbedUrl"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              @load="onMapLoad"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MapSection',
  data() {
    return {
      titleVisible: false,
      mapVisible: false,
      mapType: 'google',
      userLocation: null,
      distance: null,
      travelTime: null,
      locationPermission: null,
      isCalculatingDistance: false,
      storeInfo: {
        address: 'Av. Costanera 3785, Coquimbo - Chile.',
        phone: '+56 9 1234 5678',
        email: 'contacto@manuva-a.cl',
        schedules: [
          'Lunes – Viernes: 07:00 – 20:00',
          'Sábado: 08:00 – 18:00',
          'Domingo: 08:00 – 13:00',
        ],
        coordinates: {
          lat: -29.955395662781825,
          lng: -71.30466340306107
        }
      }
    }
  },
  computed: {
    googleMapsEmbedUrl() {
      const { lat, lng } = this.storeInfo.coordinates
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.7!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zCoquimbo!5e0!3m2!1ses!2scl!4v1234567890123!5m2!1ses!2scl`
    }
  },
  mounted() {
    this.observeVisibility()
  },
  methods: {
    observeVisibility() {
      const opts = (delay, prop) => new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => { this[prop] = true }, delay)
          }
        })
      }, { threshold: 0.2 })

      if (this.$refs.title)        opts(200, 'titleVisible').observe(this.$refs.title)
      if (this.$refs.mapContainer) opts(400, 'mapVisible').observe(this.$refs.mapContainer)
    },
    openDirections() {
      const { lat, lng } = this.storeInfo.coordinates
      const url = this.userLocation
        ? `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.storeInfo.address)}`
      window.open(url, '_blank')
    },
    makeCall() {
      window.location.href = `tel:${this.storeInfo.phone}`
    },
    onMapLoad() {},
    requestLocation() {
      if (!navigator.geolocation) return
      this.isCalculatingDistance = true
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          this.locationPermission = 'granted'
          this.calculateDistance()
          this.isCalculatingDistance = false
        },
        err => {
          this.isCalculatingDistance = false
          if (err.code === err.PERMISSION_DENIED) this.locationPermission = 'denied'
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    },
    calculateDistance() {
      if (!this.userLocation) return
      const R = 6371
      const dLat = this.degToRad(this.storeInfo.coordinates.lat - this.userLocation.lat)
      const dLng = this.degToRad(this.storeInfo.coordinates.lng - this.userLocation.lng)
      const a = Math.sin(dLat/2)**2 +
        Math.cos(this.degToRad(this.userLocation.lat)) *
        Math.cos(this.degToRad(this.storeInfo.coordinates.lat)) *
        Math.sin(dLng/2)**2
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      this.distance = d.toFixed(1)
      this.travelTime = Math.round(d / 30 * 60)
    },
    degToRad(deg) { return deg * Math.PI / 180 }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Sección ── */
.map-section {
  background: linear-gradient(180deg, #f5fbf7 0%, #edf7f2 100%);
  padding: 100px 0 110px;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2.5rem;
}

/* ── Header ── */
.section-header {
  text-align: center;
  margin-bottom: 56px;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.section-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.section-tag {
  display: inline-block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #1d7850;
  margin-bottom: 12px;
  position: relative;
  padding: 0 16px;
}

.section-tag::before,
.section-tag::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30px;
  height: 1px;
  background: #1d7850;
  opacity: 0.4;
}
.section-tag::before { right: 100%; }
.section-tag::after  { left:  100%; }

.section-header h2 {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 600;
  color: #1a3d2b;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.section-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #5a8a72;
  font-weight: 300;
}

/* ── Grid ── */
.map-container {
  display: grid;
  grid-template-columns: 360px 1fr;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(10, 40, 20, 0.12);
  min-height: 560px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.map-container.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Panel izquierdo ── */
.map-info {
  background: linear-gradient(160deg, #f0f9f4 0%, #e8f5f0 100%);
  padding: 2.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  border-right: 1px solid rgba(29, 120, 80, 0.1);
}

/* Header del club */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba(29, 120, 80, 0.1);
}

.info-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a3d2b;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(29, 120, 80, 0.1);
  color: #1d7850;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  border: 1px solid rgba(29, 120, 80, 0.2);
}

.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #1d7850;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

/* Items de detalle */
.info-details {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  flex: 1;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(29, 120, 80, 0.08);
  border: 1px solid rgba(29, 120, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d7850;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-icon.accent {
  background: rgba(29, 120, 80, 0.12);
  border-color: rgba(29, 120, 80, 0.25);
}

.detail-content strong {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: #1d7850;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 3px;
}

.detail-content p {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #4a6e58;
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
}

.distance-val {
  color: #1d7850 !important;
  font-weight: 500 !important;
}

/* Botón geolocalización */
.location-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #1d7850, #0d4a5c);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(29, 120, 80, 0.25);
}

.location-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 120, 80, 0.35);
}

.location-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(29, 120, 80, 0.1);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.7rem;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #1d7850, #0d4a5c);
  color: #fff;
  box-shadow: 0 4px 14px rgba(29, 120, 80, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(29, 120, 80, 0.35);
}

.btn-secondary {
  background: transparent;
  color: #1d7850;
  border: 1.5px solid rgba(29, 120, 80, 0.3);
}

.btn-secondary:hover {
  background: rgba(29, 120, 80, 0.06);
  border-color: #1d7850;
  transform: translateY(-2px);
}

/* ── Mapa ── */
.map-wrapper {
  position: relative;
  min-height: 560px;
}

.google-map,
.google-map iframe {
  width: 100%;
  height: 100%;
  min-height: 560px;
  display: block;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .map-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .map-wrapper,
  .google-map,
  .google-map iframe {
    min-height: 400px;
  }

  .action-buttons { flex-direction: column; }
}

@media (max-width: 560px) {
  .map-info { padding: 1.5rem; }
}
</style>