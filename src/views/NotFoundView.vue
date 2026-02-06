<template>
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="title">Página no encontrada</h1>
        <p class="message">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <div class="actions">
          <router-link to="/dashboard" class="btn-primary">Ir al Dashboard</router-link>
          <router-link to="/" class="btn-secondary">Volver al Inicio</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundView'
  }
  </script>
  
  <style scoped>
  .not-found-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f7f9fc;
    padding: 20px;
  }
  
  .not-found-content {
    text-align: center;
    max-width: 500px;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .error-code {
    font-size: 6rem;
    font-weight: 700;
    color: #42b983;
    line-height: 1;
    margin-bottom: 10px;
  }
  
  .title {
    font-size: 1.8rem;
    color: #333;
    margin: 0 0 15px 0;
  }
  
  .message {
    color: #666;
    margin-bottom: 30px;
    font-size: 1.1rem;
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-primary, .btn-secondary {
    display: inline-block;
    padding: 12px 20px;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s;
  }
  
  .btn-primary {
    background-color: #42b983;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #3aa876;
  }
  
  .btn-secondary {
    background-color: transparent;
    color: #42b983;
    border: 1px solid #42b983;
  }
  
  .btn-secondary:hover {
    background-color: rgba(66, 185, 131, 0.1);
  }
  
  @media (min-width: 768px) {
    .actions {
      flex-direction: row;
      justify-content: center;
      gap: 15px;
    }
  }
  </style>