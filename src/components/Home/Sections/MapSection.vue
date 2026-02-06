<template>
  <section id="ubicacion" class="section">
    <div class="container">
      <h2 class="section-title" :class="{ 'animate-in': titleVisible }" ref="title">
        {{ sectionTitle }}
      </h2>
      <p class="section-subtitle" :class="{ 'animate-in': titleVisible }">
        Visítanos en nuestra tienda física
      </p>
      
      <div class="map-container" :class="{ 'animate-in': mapVisible }" ref="mapContainer">
        <div class="map-info">
          <div class="info-card">
            <div class="info-header">
              <h3>🌸 Florería Colibrí</h3>
              <span class="status-badge">Abierto</span>
            </div>
            
            <div class="info-details">
              <div class="detail-item">
                <span class="icon">📍</span>
                <div class="detail-content">
                  <strong>Dirección</strong>
                  <p>{{ storeInfo.address }}</p>
                </div>
              </div>
              
              <!-- Nueva sección de distancia -->
              <div v-if="userLocation && distance" class="detail-item distance-info">
                <span class="icon">📏</span>
                <div class="detail-content">
                  <strong>Distancia desde tu ubicación</strong>
                  <p class="distance-text">📍 {{ distance }} km</p>
                  <p v-if="travelTime" class="travel-time">🚗 Aprox. {{ travelTime }} minutos en auto</p>
                </div>
              </div>
              
              <!-- Botón para solicitar ubicación -->
              <div v-else-if="!userLocation && locationPermission !== 'denied'" class="detail-item">
                <span class="icon">🎯</span>
                <div class="detail-content">
                  <strong>Calcular distancia</strong>
                  <button class="location-btn" @click="requestLocation" :disabled="isCalculatingDistance">
                    <span v-if="isCalculatingDistance">📍 Obteniendo ubicación...</span>
                    <span v-else>📍 Usar mi ubicación</span>
                  </button>
                </div>
              </div>
              
              <div class="detail-item">
                <span class="icon">📞</span>
                <div class="detail-content">
                  <strong>Teléfono</strong>
                  <p>{{ storeInfo.phone }}</p>
                </div>
              </div>
              
              <div class="detail-item">
                <span class="icon">🕐</span>
                <div class="detail-content">
                  <strong>Horarios</strong>
                  <p v-for="(schedule, index) in storeInfo.schedules" :key="index">
                    {{ schedule }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="direction-btn" @click="openDirections">
                <span class="btn-icon">🧭</span>
                <span v-if="userLocation">Ruta optimizada</span>
                <span v-else>Cómo llegar</span>
              </button>
              <button class="call-btn" @click="makeCall">
                <span class="btn-icon">📞</span>
                Llamar
              </button>
            </div>
          </div>
        </div>
        
        <div class="map-wrapper">
          <!-- Opción 1: Google Maps Embebido -->
          <div v-if="mapType === 'google'" class="google-map">
            <iframe
              :src="googleMapsEmbedUrl"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              @load="onMapLoad">
            </iframe>
          </div>
          
          <!-- Opción 2: Mapa Interactivo Mejorado -->
          <div v-else class="interactive-map" @click="openInMaps">
            <div class="map-placeholder">
              <div class="map-pin">📍</div>
              <div class="map-roads">
                <div class="road road-1"></div>
                <div class="road road-2"></div>
                <div class="road road-3"></div>
              </div>
              <div class="map-buildings">
                <div class="building building-1">🏢</div>
                <div class="building building-2">🏠</div>
                <div class="building building-3">🌸</div>
              </div>
              <div class="map-info-overlay">
                <h4>🌸 Florería Bella</h4>
                <p>{{ storeInfo.address }}</p>
                <div v-if="userLocation && distance" class="distance-overlay">
                  <p class="distance-badge">📏 {{ distance }} km de tu ubicación</p>
                </div>
                <span class="click-hint">👆 Click para abrir en mapas</span>
              </div>
              <div class="map-grid"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Selector de tipo de mapa -->
      <!-- <div class="map-controls">
        <button 
          :class="{ active: mapType === 'google' }"
          @click="mapType = 'google'"
          class="map-toggle"
        >
          Google Maps
        </button>
        <button 
          :class="{ active: mapType === 'interactive' }"
          @click="mapType = 'interactive'"
          class="map-toggle"
        >
          Vista Interactiva
        </button>
      </div> -->
    </div>
  </section>
</template>

<script>
export default {
  name: 'MapSection',
  data() {
    return {
      sectionTitle: 'Nuestra Ubicación',
      titleVisible: false,
      mapVisible: false,
      mapType: 'google', // Mantener como estaba
      // Nuevas variables para geolocalización
      userLocation: null,
      distance: null,
      travelTime: null,
      locationPermission: null,
      isCalculatingDistance: false,
      storeInfo: {
        address: 'Av. Providencia 1234, Providencia, Santiago',
        phone: '+56 9 1234 5678',
        schedules: [
          'Lun - Sáb: 9:00 - 19:00',
          'Domingo: 10:00 - 16:00'
        ],
        coordinates: {
          lat: -33.4569,
          lng: -70.6483
        }
      }
    }
  },
  computed: {
    googleMapsEmbedUrl() {
      // Mantener la URL original que ya funciona
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.7!2d${this.storeInfo.coordinates.lng}!3d${this.storeInfo.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI3JzI1LjAiUyA3MMKwMzgnNTQuMCJX!5e0!3m2!1sen!2scl!4v1234567890123!5m2!1sen!2scl`
    }
  },
  mounted() {
    this.observeVisibility()
  },
  methods: {
    observeVisibility() {
      const titleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                this.titleVisible = true
              }, 200)
              titleObserver.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.3 }
      )
      
      const mapObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                this.mapVisible = true
              }, 400)
              mapObserver.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.2 }
      )
      
      if (this.$refs.title) {
        titleObserver.observe(this.$refs.title)
      }
      
      if (this.$refs.mapContainer) {
        mapObserver.observe(this.$refs.mapContainer)
      }
    },
    
    // Método mejorado para direcciones
    openDirections() {
      const lat = this.storeInfo.coordinates.lat
      const lng = this.storeInfo.coordinates.lng
      
      let url
      if (this.userLocation) {
        // Ruta optimizada desde ubicación actual
        const userLat = this.userLocation.lat
        const userLng = this.userLocation.lng
        url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`
      } else {
        // Mantener método original
        const address = encodeURIComponent(this.storeInfo.address)
        url = `https://www.google.com/maps/dir/?api=1&destination=${address}`
      }
      
      window.open(url, '_blank')
    },
    
    makeCall() {
      window.location.href = `tel:${this.storeInfo.phone}`
    },
    
    // Método mejorado para abrir mapas
    openInMaps() {
      const lat = this.storeInfo.coordinates.lat
      const lng = this.storeInfo.coordinates.lng
      
      // Detectar dispositivo y abrir app apropiada
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        // iOS - Apple Maps
        window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`)
      } else if (/android/i.test(userAgent)) {
        // Android - Google Maps
        window.open(`geo:${lat},${lng}?q=${lat},${lng}`)
      } else {
        // Desktop - Google Maps web
        const address = encodeURIComponent(this.storeInfo.address)
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`)
      }
    },
    
    onMapLoad() {
      console.log('Mapa cargado exitosamente')
    },
    
    // Nuevos métodos para geolocalización
    requestLocation() {
      if (!navigator.geolocation) {
        alert('Tu navegador no soporta geolocalización')
        return
      }

      this.isCalculatingDistance = true
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          this.locationPermission = 'granted'
          this.calculateDistance()
          this.isCalculatingDistance = false
        },
        (error) => {
          this.isCalculatingDistance = false
          this.handleLocationError(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache por 5 minutos
        }
      )
    },
    
    handleLocationError(error) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          this.locationPermission = 'denied'
          alert('❌ Permisos de ubicación denegados. Puedes habilitarlos en la configuración de tu navegador.')
          break
        case error.POSITION_UNAVAILABLE:
          alert('❌ No se pudo obtener tu ubicación. Verifica tu conexión GPS.')
          break
        case error.TIMEOUT:
          alert('⏰ Tiempo agotado al obtener ubicación. Intenta nuevamente.')
          break
        default:
          alert('❌ Error desconocido al obtener ubicación.')
          break
      }
    },
    
    calculateDistance() {
      if (!this.userLocation) return
      
      const userLat = this.userLocation.lat
      const userLng = this.userLocation.lng
      const storeLat = this.storeInfo.coordinates.lat
      const storeLng = this.storeInfo.coordinates.lng
      
      // Fórmula de Haversine para calcular distancia
      const R = 6371 // Radio de la Tierra en km
      const dLat = this.degToRad(storeLat - userLat)
      const dLng = this.degToRad(storeLng - userLng)
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.degToRad(userLat)) * Math.cos(this.degToRad(storeLat)) *
        Math.sin(dLng/2) * Math.sin(dLng/2)
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      this.distance = distance.toFixed(1)
      
      // Estimar tiempo de viaje (velocidad promedio 30 km/h en ciudad)
      const timeInHours = distance / 30
      const timeInMinutes = Math.round(timeInHours * 60)
      this.travelTime = timeInMinutes
    },
    
    degToRad(deg) {
      return deg * (Math.PI/180)
    }
  }
}
</script>

<style scoped>
.section {
  padding: 80px 0;
}

.container {
  max-width: 1400px; /* Aumentado de 1200px */
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

.map-container {
  display: grid;
  grid-template-columns: 380px 1fr; /* Cambio: panel fijo + mapa flexible */
  gap: 2rem;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  opacity: 0;
  transform: translateY(40px);
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 600px; /* Altura mínima aumentada */
}

.map-container.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.map-info {
  padding: 2rem;
  background: linear-gradient(135deg, #f8fdf8, #e8f5e8);
  min-width: 380px; /* Ancho mínimo para el panel de información */
}

.info-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.info-header h3 {
  color: #2d6a4f;
  font-size: 1.3rem;
}

.status-badge {
  background: #52b788;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.detail-item .icon {
  font-size: 1.5rem;
  margin-top: 0.2rem;
}

.detail-content strong {
  color: #2d6a4f;
  display: block;
  margin-bottom: 0.3rem;
}

.detail-content p {
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* Nuevos estilos para funcionalidades de geolocalización */
.distance-info {
  background: linear-gradient(135deg, #e8f5e8, #f0fdf0);
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #52b788;
}

.distance-text {
  color: #2d6a4f !important;
  font-weight: bold;
  font-size: 1.1rem;
}

.travel-time {
  color: #52b788 !important;
  font-weight: 600;
  font-size: 0.9rem;
}

.location-btn {
  background: linear-gradient(135deg, #74c69d, #52b788);
  color: white;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  width: 100%;
}

.location-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #52b788, #40916c);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 183, 136, 0.3);
}

.location-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.distance-overlay {
  margin: 0.5rem 0;
}

.distance-badge {
  background: rgba(82, 183, 136, 0.9);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  backdrop-filter: blur(5px);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.direction-btn,
.call-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.direction-btn {
  background: #52b788;
  color: white;
}

.direction-btn:hover {
  background: #40916c;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(82, 183, 136, 0.3);
}

.call-btn {
  background: #e8f5e8;
  color: #2d6a4f;
  border: 2px solid #52b788;
}

.call-btn:hover {
  background: #52b788;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1rem;
}

.map-wrapper {
  position: relative;
  min-height: 600px; /* Altura mínima aumentada */
  height: 100%; /* Ocupa toda la altura disponible */
}

.google-map {
  width: 100%;
  height: 100%;
  min-height: 600px; /* Altura mínima aumentada */
}

.google-map iframe {
  width: 100%;
  height: 100%;
  min-height: 600px; /* Altura mínima aumentada */
}

.interactive-map {
  width: 100%;
  height: 100%;
  min-height: 600px; /* Altura mínima aumentada */
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #e8f5e8, #d3f4d3);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.interactive-map:hover .map-placeholder {
  background: linear-gradient(45deg, #d3f4d3, #c8e6c8);
  transform: scale(1.02);
}

.map-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(45, 106, 79, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45, 106, 79, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

.map-pin {
  font-size: 3rem;
  animation: pinBounce 2s ease-in-out infinite;
  z-index: 3;
  position: relative;
}

@keyframes pinBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

/* Elementos del mapa interactivo mejorado */
.map-roads {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.road {
  position: absolute;
  background: rgba(45, 106, 79, 0.2);
  border-radius: 2px;
}

.road-1 {
  width: 60%;
  height: 4px;
  top: 30%;
  left: 20%;
  transform: rotate(-15deg);
}

.road-2 {
  width: 4px;
  height: 50%;
  top: 25%;
  left: 70%;
  transform: rotate(10deg);
}

.road-3 {
  width: 40%;
  height: 3px;
  bottom: 30%;
  right: 10%;
  transform: rotate(25deg);
}

.map-buildings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
}

.building {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.6;
  animation: buildingFloat 4s ease-in-out infinite;
}

.building-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.building-2 {
  bottom: 25%;
  right: 20%;
  animation-delay: 1.5s;
}

.building-3 {
  top: 50%;
  left: 50%;
  font-size: 2rem;
  opacity: 0.8;
  animation-delay: 3s;
}

@keyframes buildingFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.map-info-overlay {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  z-index: 3;
}

.map-info-overlay h4 {
  color: #2d6a4f;
  margin: 0 0 0.5rem 0;
}

.map-info-overlay p {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.click-hint {
  color: #52b788;
  font-size: 0.8rem;
  font-weight: 600;
}

.map-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.map-toggle {
  padding: 0.8rem 1.5rem;
  border: 2px solid #52b788;
  background: transparent;
  color: #52b788;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.map-toggle:hover,
.map-toggle.active {
  background: #52b788;
  color: white;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1200px) {
  .container {
    max-width: 100%;
  }
  
  .map-container {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 968px) {
  .map-container {
    grid-template-columns: 320px 1fr;
    min-height: 500px;
  }
  
  .map-wrapper,
  .google-map,
  .google-map iframe,
  .interactive-map {
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .map-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  .map-info {
    min-width: auto;
  }
  
  .map-wrapper,
  .google-map,
  .google-map iframe,
  .interactive-map {
    min-height: 400px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .map-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
  
  .map-info-overlay {
    left: 1rem;
    bottom: 1rem;
    right: 1rem;
  }
}
</style>