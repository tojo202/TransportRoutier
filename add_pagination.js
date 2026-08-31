const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend-angular', 'src', 'app', 'pages');

const pages = ['agencies', 'baggages', 'drivers', 'payments', 'reports', 'reservations', 'routes', 'schedules', 'tickets', 'vehicles'];

pages.forEach(page => {
  const tsPath = path.join(pagesDir, page, `${page}.ts`);
  const htmlPath = path.join(pagesDir, page, `${page}.html`);
  
  if (fs.existsSync(tsPath)) {
    let tsContent = fs.readFileSync(tsPath, 'utf8');
    
    // Check if NgxPaginationModule is imported
    if (!tsContent.includes('NgxPaginationModule')) {
      // Add import at the top
      tsContent = "import { NgxPaginationModule } from 'ngx-pagination';\n" + tsContent;
      
      // Add to imports array
      tsContent = tsContent.replace(/imports:\s*\[([\s\S]*?)\]/, (match, p1) => {
        return `imports: [${p1}, NgxPaginationModule]`;
      });
      
      // Add page variable
      tsContent = tsContent.replace(/export class .*? {/, (match) => {
        return `${match}\n  p: number = 1;`;
      });
      
      fs.writeFileSync(tsPath, tsContent);
    }
  }

  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Find *ngFor on rows
    // It's usually `*ngFor="let item of filteredSomething"` or similar
    // We can use a regex to append the pipe if it's not already paginated
    if (!htmlContent.includes('paginate:')) {
      // Find the main ngFor
      const ngForMatch = htmlContent.match(/\*ngFor="let\s+(\w+)\s+of\s+([a-zA-Z0-9_]+)"/);
      if (ngForMatch) {
         htmlContent = htmlContent.replace(ngForMatch[0], `${ngForMatch[0].slice(0, -1)} | paginate: { itemsPerPage: 10, currentPage: p }"`);
         
         // Add pagination-controls before the closing </mat-card> or at the end
         // Find `</table>` or `</mat-card>` or `</div>` after table
         // A safe bet is after </table>
         if (htmlContent.includes('</table>')) {
           const replaceIndex = htmlContent.indexOf('</table>') + '</table>'.length;
           const before = htmlContent.slice(0, replaceIndex);
           const after = htmlContent.slice(replaceIndex);
           const controls = `\n    <div class="flex justify-center p-4 border-t mt-4">\n      <pagination-controls (pageChange)="p = $event" previousLabel="Précédent" nextLabel="Suivant"></pagination-controls>\n    </div>\n`;
           htmlContent = before + controls + after;
         }
         fs.writeFileSync(htmlPath, htmlContent);
         console.log(`Updated HTML and TS for ${page}`);
      } else {
         console.log(`Could not find ngFor in ${page}`);
      }
    } else {
      console.log(`Pagination already in ${page}`);
    }
  }
});
