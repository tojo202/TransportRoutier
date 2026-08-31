const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, 'frontend-angular', 'src', 'app', 'pages');
const pages = ['agencies', 'baggages', 'drivers', 'payments', 'reports', 'reservations', 'routes', 'schedules', 'tickets', 'vehicles'];

pages.forEach(page => {
  const htmlPath = path.join(pagesDir, page, `${page}.html`);
  if (fs.existsSync(htmlPath)) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    if (!content.includes('<pagination-controls')) {
      const controls = `\n  <div class="flex justify-center p-4 border-t mt-4 w-full">\n    <pagination-controls (pageChange)="p = $event" previousLabel="Précédent" nextLabel="Suivant"></pagination-controls>\n  </div>\n`;
      let modalIndex = content.indexOf('<!-- ── Modal');
      if (modalIndex === -1) modalIndex = content.indexOf('<!-- Modal');
      
      if (modalIndex !== -1) {
          content = content.slice(0, modalIndex) + controls + content.slice(modalIndex);
      } else {
          content += controls;
      }
      fs.writeFileSync(htmlPath, content);
      console.log('Added to', page);
    }
  }
});
