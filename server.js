const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');
const app = express();

// Middleware para SPA con Vue Router en modo history
app.use(history());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}`);
});