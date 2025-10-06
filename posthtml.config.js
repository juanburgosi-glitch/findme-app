// posthtml.config.js
module.exports = {
  plugins: {
    'posthtml-include': {
      root: __dirname, // Le dice dónde empezar a buscar archivos
    }
  }
};