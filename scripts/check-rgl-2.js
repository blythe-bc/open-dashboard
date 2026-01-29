const RGL = require('react-grid-layout');
console.log('ResponsiveGridLayout type:', typeof RGL.ResponsiveGridLayout);
try {
  const comp = RGL.ResponsiveGridLayout;
  console.log('Is valid component?', !!comp);
} catch (e) {}
