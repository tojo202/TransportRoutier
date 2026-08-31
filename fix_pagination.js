const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend-angular', 'src', 'app', 'pages');

const pages = ['agencies', 'baggages', 'drivers', 'payments', 'reports', 'reservations', 'routes', 'schedules', 'tickets', 'vehicles'];

pages.forEach(page => {
  const htmlPath = path.join(pagesDir, page, `${page}.html`);
  
  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check if it has pagination-controls
    if (!htmlContent.includes('<pagination-controls')) {
      const controls = `\n    <div class="flex justify-center p-4 border-t mt-4 w-full">\n      <pagination-controls (pageChange)="p = $event" previousLabel="Précédent" nextLabel="Suivant"></pagination-controls>\n    </div>\n`;
      
      // Attempt to append it inside the main card/container, after the list/table
      if (htmlContent.includes('</table>')) {
        const replaceIndex = htmlContent.indexOf('</table>') + '</table>'.length;
        htmlContent = htmlContent.slice(0, replaceIndex) + controls + htmlContent.slice(replaceIndex);
      } else {
         // Find the closing tag of the ngFor container
         // Usually it's `</div>\n\n</div>` at the end of the page shell
         // For grid layout like agencies:
         let match = htmlContent.match(/<div[^>]*\*ngIf="[^"]*length"[^>]*>([\s\S]*?)<\/div>\n\n/);
         if(match) {
             htmlContent = htmlContent.replace(match[0], match[0].replace(/<\/div>\n\n$/, `</div>\n${controls}\n\n`));
         } else {
             // Fallback: add it before the first modal (<!-- Modal) or at the end
             let modalIndex = htmlContent.indexOf('<!-- Modal');
             if(modalIndex !== -1) {
                 htmlContent = htmlContent.slice(0, modalIndex) + controls + htmlContent.slice(modalIndex);
             } else {
                 htmlContent += controls;
             }
         }
      }
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`Fixed pagination in ${page}`);
    }
  }
});
