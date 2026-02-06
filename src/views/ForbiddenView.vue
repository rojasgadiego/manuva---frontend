<template>
    <div class="forbidden-container">
      <div class="forbidden-content">
        <div class="error-code">403</div>
        <h1 class="title">Acceso Denegado</h1>
        <p class="message">Lo sentimos, no tienes permisos para acceder a esta página.</p>
        <div class="actions">
          <router-link to="/dashboard" class="btn-primary">Volver al Dashboard</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ForbiddenView'
  }
  </script>
  
  <style scoped>
  .forbidden-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f7f9fc;
    padding: 20px;
  }
  
  .forbidden-content {
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
    color: #ff6b6b;
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
    justify-content: center;
  }
  
  .btn-primary {
    display: inline-block;
    padding: 12px 24px;
    background-color: #42b983;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .btn-primary:hover {
    background-color: #3aa876;
  }
  </style>