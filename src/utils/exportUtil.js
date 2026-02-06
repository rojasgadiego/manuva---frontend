/**
 * Función para exportar datos a Excel
 * @param {Array} data - Array de objetos a exportar
 * @param {String} fileName - Nombre del archivo a descargar (sin extensión)
 */
export const exportToExcel = (data, fileName) => {
    if (!data || !data.length) {
      console.error('No hay datos para exportar');
      return;
    }
  
    try {
      // Crear CSV
      const headers = Object.keys(data[0]);
      
      // Crear las filas de contenido
      const csvContent = [
        // Cabeceras
        headers.join(','),
        // Contenido
        ...data.map(row => {
          return headers.map(header => {
            // Formatear el valor para CSV
            let cell = row[header] === null || row[header] === undefined ? '' : row[header];
            
            // Si es número o booleano, no necesita comillas
            if (typeof cell === 'number' || typeof cell === 'boolean') {
              return cell;
            }
            
            // Si es string, escapar comillas y envolver en comillas
            cell = String(cell).replace(/"/g, '""');
            return `"${cell}"`;
          }).join(',');
        })
      ].join('\n');
      
      // Crear el blob para descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Crear un enlace y hacer clic para descargar
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el objeto URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      return false;
    }
  };
  
  /**
   * Alternativa usando librería externa como SheetJS (xlsx)
   * Requiere instalar: npm install xlsx
   * Y descomentarla para usarla
   */
  /*
  import * as XLSX from 'xlsx';
  
  export const exportToExcelWithXLSX = (data, fileName) => {
    // Crear libro y hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Guardar archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };
  */