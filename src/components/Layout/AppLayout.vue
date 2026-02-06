<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Área sensible al hover mejorada -->
    <div class="hover-area" @mouseenter="expandSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" @mouseenter="expandSidebar" @mouseleave="collapseSidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">M</div>
          <span v-if="!isSidebarCollapsed" class="app-name">Manuva'a</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <!-- Menú para todos los usuarios -->
          <li v-for="item in filteredMenuItems" :key="item.path">
            <router-link :to="item.path" :class="{ active: isActive(item.path) }" :title="item.name"
              @click="isMobile ? closeMobileSidebar() : handleNavigation()">
              <span class="menu-icon" v-html="item.icon"></span>
              <span v-if="!isSidebarCollapsed" class="menu-text">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-avatar-container" v-if="isSidebarCollapsed">
          <div class="user-avatar">{{ userInitials }}</div>
        </div>
        <div class="user-info" v-if="!isSidebarCollapsed">
          <div class="user-name">{{ currentUser ? currentUser.email : 'Usuario' }}</div>
          <div class="user-role">{{ userRoles.length > 0 ? userRoles[0] : 'Rol no asignado' }}</div>
        </div>
        <button class="logout-button" @click="logout" :title="isSidebarCollapsed ? 'Cerrar sesión' : ''">
          <span class="logout-icon">⏻</span>
          <span v-if="!isSidebarCollapsed" class="logout-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Overlay para cerrar el sidebar en móviles -->
    <div v-if="isMobile && !isSidebarCollapsed" class="sidebar-overlay" @click="closeMobileSidebar"></div>

    <!-- Main content -->
    <div class="main-content">
      <header class="top-header">
        <!-- Botón de menú para móviles -->
        <button v-if="isMobile" class="menu-button" @click="expandSidebar" aria-label="Abrir menú">
          ☰
        </button>
        <div class="breadcrumb">
          {{ currentRouteName }}
        </div>

        <!-- Header actions solo con carrito -->
        <div class="header-actions">
          <!-- Carrito (solo mostrar si hay items) -->
          <button v-if="cart.items.length > 0" class="cart-summary-btn" @click="toggleCartDetails"
            :title="`Carrito: ${cart.totalItems} items`">
            <span class="cart-icon">🛒</span>
            <span class="cart-badge">{{ cart.totalItems }}</span>
            <span v-if="!isMobile" class="cart-total">{{ formatCurrency(cart.total) }}</span>
          </button>
        </div>
      </header>

      <main class="content-wrapper">
        <slot></slot>
      </main>
    </div>

    <!-- Notificación de escaneo exitoso -->
    <transition name="scan-notification-slide">
      <div v-if="showScanNotification" class="scan-notification success">
        <div class="notification-content">
          <span class="notification-icon">✅</span>
          <div class="notification-text">
            <div class="product-name">{{ lastScannedProduct?.nombre }}</div>
            <div class="notification-message">Agregado al carrito</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Notificación de producto no encontrado -->
    <transition name="scan-notification-slide">
      <div v-if="showErrorNotification" class="scan-notification error">
        <div class="notification-content">
          <span class="notification-icon">❌</span>
          <div class="notification-text">
            <div class="product-code">{{ lastScannedCode }}</div>
            <div class="notification-message">Producto no encontrado</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Detalles del carrito expandido -->
    <transition name="cart-details-slide">
      <div v-if="showCartDetails && cart.items.length > 0" class="cart-details">
        <div class="cart-header">
          <h4>Carrito de Compras</h4>
          <button class="clear-cart" @click="clearCart">Limpiar</button>
        </div>

        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.code" class="cart-item">
            <div class="item-info">
              <span class="item-name">{{ item.product.nombre }}</span>
              <span class="item-code">{{ item.code }}</span>
            </div>
            <div class="item-quantity">
              <button @click="updateQuantity(item.code, item.quantity - 1)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item.code, item.quantity + 1)">+</button>
            </div>
            <div class="item-price">{{ formatCurrency(item.product.precio_unitario * item.quantity) }}</div>
            <button class="remove-item" @click="removeFromCart(item.code)">×</button>
          </div>
        </div>

        <div class="cart-footer">
          <div class="cart-total-section">
            <strong>Total: {{ formatCurrency(cart.total) }}</strong>
          </div>
          <div class="cart-actions">
            <button class="btn-secondary" @click="saveCart">Guardar</button>
            <button class="btn-primary" @click="processCart">Procesar</button>
          </div>
        </div>
      </div>
    </transition>

    <NotificationContainer />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useScanner } from '@/composables/useScanner'
import { useNotifications } from '@/composables/useNotifications'
import NotificationContainer from '../UI/NotificationContainer.vue'

export default {
  name: 'AppLayout',
  components: {
    NotificationContainer
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { warning } = useNotifications()
    const { activate, deactivate, isActive: scannerActive, lastScannedCode } = useScanner()

    // Estados existentes del sidebar
    const isSidebarCollapsed = ref(true)
    const autoCollapseEnabled = ref(true)
    const isMobile = ref(false)
    let collapseTimer = null

    // Estados del scanner (simplificados)
    const showScanNotification = ref(false)
    const showErrorNotification = ref(false)
    const lastScannedProduct = ref(null)
    let notificationTimer = null

    // Estados del carrito
    const cart = ref({
      items: [],
      totalItems: 0,
      total: 0
    })
    const showCartDetails = ref(false)

    // Función para obtener headers de autorización
    const getAuthHeaders = () => {
      try {
        const token = localStorage.getItem('token')
        return {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      } catch (error) {
        console.error('Error al obtener headers:', error)
        return { 'Content-Type': 'application/json' }
      }
    }

    // Buscar producto por código (simplificada)
    const searchProductByCode = async (code) => {
      try {
        // Buscar en lotes primero
        const lotesResponse = await fetch(`http://localhost:3000/api/lotes/codigo/${code}`, {
          headers: getAuthHeaders()
        })

        if (lotesResponse.ok) {
          const lotesResult = await lotesResponse.json()
          if (lotesResult.status === 'success' && lotesResult.data) {
            return {
              ...lotesResult.data.producto,
              precio: lotesResult.data.producto.precio_unitario,
              codigo: lotesResult.data.codigo_interno,
              stock: lotesResult.data.cantidad_actual,
              fecha_caducidad: lotesResult.data.fecha_caducidad,
              lote: lotesResult.data
            }
          }
        }

        return null
      } catch (err) {
        console.error('Error al buscar producto:', err)
        return null
      }
    }

    // Mostrar notificación personalizada
    const showNotification = (type, product = null, code = null) => {
      // Limpiar notificación anterior
      if (notificationTimer) {
        clearTimeout(notificationTimer)
        showScanNotification.value = false
        showErrorNotification.value = false
      }

      if (type === 'success' && product) {
        lastScannedProduct.value = product
        showScanNotification.value = true
      } else if (type === 'error' && code) {
        lastScannedCode.value = code
        showErrorNotification.value = true
      }

      // Auto-ocultar después de 2 segundos
      notificationTimer = setTimeout(() => {
        showScanNotification.value = false
        showErrorNotification.value = false
      }, 2000)
    }

    // Manejar escaneo detectado (simplificado y automático)
    const handleScanDetected = async (code) => {
      try {
        // Limpiar el código de caracteres problemáticos
        let cleanCode = String(code).trim()
        console.log('Código escaneado:', cleanCode)

        // Tratamiento del código escaneado
        let processedCode = cleanCode
        
        // Si el código tiene el formato LOTE'LT250001'221961 o LOTELT250001221961
        if (cleanCode.startsWith('LOTE') && cleanCode.length > 4) {
          // Extraer la parte después de "LOTE"
          let withoutLote = cleanCode.substring(4) // Quita "LOTE"
          
          // Si hay comillas, extraer lo que está entre ellas
          const quotesMatch = withoutLote.match(/'([^']+)'/)
          if (quotesMatch) {
            processedCode = quotesMatch[1] // Extrae lo que está entre comillas
          } 
          // Si no hay comillas, extraer LT + 6 dígitos (8 caracteres total)
          else if (withoutLote.startsWith('LT') && withoutLote.length >= 8) {
            processedCode = withoutLote.substring(0, 8) // LT + 6 dígitos
          }
        }

        const product = await searchProductByCode(processedCode)

        if (product) {
          // Agregar automáticamente al carrito
          const cartItem = {
            code: processedCode,
            product: product,
            quantity: 1
          }
          
          addToCart(cartItem)
          showNotification('success', product)
        } else {
          showNotification('error', null, processedCode)
        }
      } catch (error) {
        console.error('Error en handleScanDetected:', error)
        showNotification('error', null)
      }
    }

    // Watch para detectar escaneos
    watch(lastScannedCode, (newCode) => {
      if (newCode) {
        handleScanDetected(newCode)
      }
    })

    // Funciones del carrito
    const updateCartTotals = () => {
      cart.value.totalItems = cart.value.items.reduce((sum, item) => sum + item.quantity, 0)
      cart.value.total = cart.value.items.reduce((sum, item) => sum + (item.product.precio_unitario * item.quantity), 0)
    }

    const addToCart = (item) => {
      const existingItem = cart.value.items.find(cartItem => cartItem.code === item.code)

      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        cart.value.items.push(item)
      }

      updateCartTotals()
      saveCart()
    }

    const removeFromCart = (code) => {
      const index = cart.value.items.findIndex(item => item.code === code)
      if (index > -1) {
        cart.value.items.splice(index, 1)
        updateCartTotals()
        saveCart()
      }
    }

    const updateQuantity = (code, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(code)
        return
      }

      const item = cart.value.items.find(cartItem => cartItem.code === code)
      if (item) {
        item.quantity = newQuantity
        updateCartTotals()
        saveCart()
      }
    }

    const clearCart = () => {
      cart.value.items = []
      updateCartTotals()
      showCartDetails.value = false
      saveCart()
      warning('Carrito limpiado')
    }

    const toggleCartDetails = () => {
      showCartDetails.value = !showCartDetails.value
    }

    const saveCart = () => {
      try {
        localStorage.setItem('shopping_cart', JSON.stringify(cart.value.items))
      } catch (err) {
        console.error('Error al guardar carrito:', err)
      }
    }

    const loadSavedCart = () => {
      try {
        const savedCart = localStorage.getItem('shopping_cart')
        if (savedCart) {
          cart.value.items = JSON.parse(savedCart)
          updateCartTotals()
        }
      } catch (err) {
        console.error('Error al cargar carrito guardado:', err)
      }
    }

    const processCart = () => {
      if (cart.value.items.length === 0) {
        warning('El carrito está vacío')
        return
      }

      // Navegar a checkout o procesar venta
      router.push('/ventas/nueva', { state: { cart: cart.value } })
    }

    // Función para formatear moneda
    const formatCurrency = (value) => {
      const numero = parseFloat(value)
      if (isNaN(numero)) return '$0.00'

      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero)
    }

    // Funciones existentes del sidebar
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      if (isMobile.value) {
        autoCollapseEnabled.value = false
      } else {
        autoCollapseEnabled.value = true
      }
    }

    const closeMobileSidebar = () => {
      if (isMobile.value) {
        isSidebarCollapsed.value = true
      }
    }

    const expandSidebar = () => {
      clearTimeout(collapseTimer)
      isSidebarCollapsed.value = false
    }

    const collapseSidebar = () => {
      if (autoCollapseEnabled.value && !isMobile.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => {
          isSidebarCollapsed.value = true
        }, 300)
      }
    }

    const handleNavigation = () => {
      if (autoCollapseEnabled.value && !isMobile.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => {
          isSidebarCollapsed.value = true
        }, 2000)
      }
    }

    // Estados y funciones existentes del usuario
    const currentUser = computed(() => store.getters['auth/currentUser'])
    const userRoles = computed(() => store.getters['auth/userRoles'] || [])
    const userInitials = computed(() => {
      if (!currentUser.value) return '?'
      const email = currentUser.value.email || ''
      return email.charAt(0).toUpperCase()
    })

    const currentRouteName = computed(() => {
      return route.meta.title || route.name || 'Dashboard'
    })

    // Menú existente
    const menuItems = [
      // {
      //   name: 'Ventas',
      //   path: '/ventas',
      //   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM12 8v8m-4-4h8"></path></svg>',
      //   roles: ['admin', 'usuario']
      // },
      // {
      //   name: 'Inventario',
      //   path: '/inventory',
      //   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',
      //   roles: ['admin', 'editor', 'usuario']
      // },
      // {
      //   name: 'Movimientos',
      //   path: '/movements',
      //   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
      //   roles: ['admin', 'editor', 'usuario']
      // },
      // {
      //   name: 'Personal',
      //   path: '/personal',
      //   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      //   roles: ['admin', 'editor', 'usuario']
      // }
    ]

    const filteredMenuItems = computed(() => {
      return menuItems.filter(item => {
        if (!item.roles || item.roles.length === 0) {
          return true
        }

        if (!userRoles.value || userRoles.value.length === 0) {
          return item.roles.length === 0
        }

        return item.roles.some(role => userRoles.value.includes(role))
      })
    })

    const isActive = (path) => {
      return route.path === path || route.path.startsWith(`${path}/`)
    }

    const logout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)

      // Activar scanner automáticamente al cargar
      activate({
        scanDelay: 100,
        minScanLength: 8,
        maxScanLength: 50,
        scanCooldown: 1000
      })

      // Cargar carrito guardado
      loadSavedCart()

      // Resto de la lógica existente del sidebar
      const savedState = localStorage.getItem('sidebarState')
      if (savedState) {
        isSidebarCollapsed.value = savedState === 'collapsed'
      }

      if (autoCollapseEnabled.value && !isMobile.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => {
          isSidebarCollapsed.value = true
        }, 2000)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(collapseTimer)
      if (notificationTimer) {
        clearTimeout(notificationTimer)
      }
      if (scannerActive.value) {
        deactivate()
      }
    })

    // Watches existentes
    watch(() => route.path, () => {
      if (isMobile.value) {
        isSidebarCollapsed.value = true
      } else if (autoCollapseEnabled.value) {
        clearTimeout(collapseTimer)
        collapseTimer = setTimeout(() => {
          isSidebarCollapsed.value = true
        }, 2000)
      }
    })

    watch(() => isSidebarCollapsed.value, (newValue) => {
      localStorage.setItem('sidebarState', newValue ? 'collapsed' : 'expanded')
    })

    return {
      // Estados existentes del sidebar
      isSidebarCollapsed,
      isMobile,
      currentUser,
      userRoles,
      userInitials,
      currentRouteName,
      filteredMenuItems,

      // Estados del scanner y carrito (simplificados)
      showScanNotification,
      showErrorNotification,
      lastScannedProduct,
      lastScannedCode,
      cart,
      showCartDetails,

      // Métodos existentes del sidebar
      expandSidebar,
      collapseSidebar,
      handleNavigation,
      isActive,
      logout,
      closeMobileSidebar,

      // Métodos del carrito
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCartDetails,
      saveCart,
      processCart,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fb;
  position: relative;
}

.hover-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 100%;
  z-index: 15;
  cursor: default;
}

.sidebar {
  background-color: #fff;
  width: 250px;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 10;
  height: 100vh;
}

.sidebar-collapsed .sidebar {
  width: 70px;
  overflow: hidden;
}

.sidebar-header {
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  transition: padding 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .sidebar-header {
  padding: 18px 0;
  justify-content: center;
}

.logo-container {
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: #743cfa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-right: 10px;
  flex-shrink: 0;
  transition: margin 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .logo-icon {
  margin-right: 0;
}

.app-name {
  font-size: 1.2rem;
  font-weight: 600;
  white-space: nowrap;
  color: #743cfa;
  font-family: 'Pacifico', cursive, sans-serif;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding-top: 12px;
  transition: padding 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 20px;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 3px;
  padding: 0 8px;
  transition: padding 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .sidebar-nav li {
  padding: 0;
  text-align: center;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 12px;
  text-decoration: none;
  color: #555;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.sidebar-collapsed .sidebar-nav a {
  justify-content: center;
  padding: 12px 0;
  border-left: none;
}

.sidebar-nav a:hover {
  background-color: #f5f7fb;
  color: #8d42b9;
}

.sidebar-nav a.active {
  background-color: #fbf7fc;
  color: #8d42b9;
  font-weight: 500;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  margin-right: 14px;
  flex-shrink: 0;
  color: inherit;
  transition: margin 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .menu-icon {
  margin-right: 0;
  width: 20px;
  height: 20px;
}

.menu-text {
  white-space: nowrap;
  font-size: 0.95rem;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar-footer {
  border-top: 1px solid #f0f0f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: padding 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .sidebar-footer {
  padding: 16px 0;
}

.user-info {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f0f0f0;
  width: 100%;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.user-avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: #9240b3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
  transition: all 0.3s ease;
}

.user-name {
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.user-role {
  font-size: 0.8rem;
  color: #777;
  text-transform: capitalize;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .logout-button {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.logout-button:hover {
  background-color: #ffe5e5;
  color: #e74c3c;
}

.logout-icon {
  margin-right: 10px;
  transition: margin 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.sidebar-collapsed .logout-icon {
  margin-right: 0;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  position: relative;
  transition: margin-left 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.top-header {
  height: 64px;
  background-color: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
}

.menu-button {
  background: none;
  border: none;
  font-size: 20px;
  margin-right: 12px;
  padding: 8px;
  cursor: pointer;
  color: #333;
  display: none;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.menu-button:hover {
  background-color: #f5f7fb;
}

.breadcrumb {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content-wrapper {
  flex: 1;
  padding: 20px 24px;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Estilos del carrito */
.cart-summary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #10b981;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #10b981;
  position: relative;
}

.cart-summary-btn:hover {
  background: #f0fdf4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.cart-icon {
  font-size: 16px;
}

.cart-badge {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  position: absolute;
  top: -2px;
  right: -2px;
}

.cart-total {
  font-weight: 700;
  color: #059669;
}

/* Estilos de las notificaciones */
.scan-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
}

.scan-notification.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-left: 4px solid #047857;
}

.scan-notification.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-left: 4px solid #b91c1c;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-weight: 700;
  font-size: 15px;
  line-height: 1.2;
}

.product-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.notification-message {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
}

/* Estilos del carrito expandido */
.cart-details {
  position: fixed;
  top: 80px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 350px;
  max-height: 400px;
  overflow: hidden;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.cart-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.clear-cart {
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-cart:hover {
  background: #dc2626;
  color: white;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  max-height: 250px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.item-code {
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-quantity button {
  background: #f3f4f6;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.item-quantity button:hover {
  background: #e5e7eb;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  min-width: 80px;
  text-align: right;
}

.remove-item {
  background: #fee2e2;
  border: none;
  color: #dc2626;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.remove-item:hover {
  background: #fecaca;
}

.cart-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.cart-total-section {
  margin-bottom: 12px;
  text-align: center;
  font-size: 16px;
  color: #1f2937;
}

.cart-actions {
  display: flex;
  gap: 8px;
}

.cart-actions button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* Animaciones */
.scan-notification-slide-enter-active,
.scan-notification-slide-leave-active {
  transition: all 0.2s ease;
}

.scan-notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.scan-notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.cart-details-slide-enter-active,
.cart-details-slide-leave-active {
  transition: all 0.15s ease;
}

.cart-details-slide-enter-from,
.cart-details-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Estilos para móviles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
    width: 250px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), width 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }
  
  .sidebar-collapsed .sidebar {
    transform: translateX(-100%);
  }
  
  .app-wrapper:not(.sidebar-collapsed) .sidebar {
    transform: translateX(0);
  }
  
  .sidebar-collapsed .main-content {
    margin-left: 0;
  }
  
  .menu-button {
    display: flex;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  .top-header {
    padding: 0 16px;
  }
  
  .hover-area {
    display: none;
  }
  
  .header-actions {
    gap: 8px;
  }
  
  .cart-total {
    display: none;
  }
  
  .cart-details {
    right: 10px;
    left: 10px;
    width: auto;
    top: 70px;
  }
  
  .scan-notification {
    right: 10px;
    left: 10px;
    min-width: auto;
    top: 70px;
  }
}

@media (max-width: 480px) {
  .cart-summary-btn {
    padding: 6px 8px;
  }
  
  .cart-icon {
    font-size: 14px;
  }
  
  .cart-badge {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
  
  .notification-icon {
    font-size: 18px;
  }
  
  .product-name,
  .product-code {
    font-size: 13px;
  }
  
  .notification-message {
    font-size: 12px;
  }
}
</style>