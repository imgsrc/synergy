var smartgrid = require('smart-grid');

smartgrid('./app/sass/precss', {
  outputStyle: 'sass',
  columns: 18,
  offset: '10px',
  container: {
    maxWidth: '1200px'
  },
  breakPoints: {
    xl: {
      width: '1280px',
      fields: '15px'
    },
    lg: {
      width: '1024px',
      fields: '15px'
    },
    md: {
      width: '992px',
      fields: "15px"
    },
    sm: {
      width: "768px",
      fields: "15px"
    },
    xs: {
      width: "375px",
      fields: "12px"
    },
    xxs: {
      width: "360px",
      fields: "10px"
    },
    xxxs: {
      width: "320px",
      fields: "10px"
    }
  }
});