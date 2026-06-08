// frontend/src/utils/pdfExporter.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interfaz para datos de ranking
export interface RankingData {
    position: number;
    user_code: string;
    points: {
        round_of_32: number;
        round_of_16: number;
        quarter_finals: number;
        semi_finals: number;
        final: number;
        champion: number;
        total: number;
    };
    submitted_at?: string;
}

// Interfaz para datos de predicción (bracket)
export interface PredictionData {
    userName: string;
    // ... otros campos que se usen en el bracket
}

/**
 * Exporta ranking a PDF con tabla
 */
export const exportRankingToPDF = (
    data: RankingData[],
    title: string = 'Ranking Mundial 2026'
): void => {
    try {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();
        
        // Título
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generado: ${date}`, 14, 30);
        doc.text(`Total de participantes: ${data.length}`, 14, 37);
        
        // Preparar datos para la tabla
        const tableData = data.map((item) => [
            item.position,
            item.user_code,
            item.points.round_of_32,
            item.points.round_of_16,
            item.points.quarter_finals,
            item.points.semi_finals,
            item.points.final,
            item.points.champion || 0,
            item.points.total
        ]);
        
        // Crear tabla
        autoTable(doc, {
            startY: 40,
            // tableWidth: 'wrap',  // ← Agregar esta línea
            head: [
                ['Posición', 'Usuario', 'GRUPOS', '16avos', 'OCTAVOS', 'CUARTOS', 'SEMIS', 'Campeón', 'Total']
            ],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185], // Azul
                textColor: 255
            },
            styles: {
        fontSize: 8, // Reducir tamaño de fuente
        cellPadding: 2, // Reducir padding
        overflow: 'linebreak' // Ajustar texto largo
    },

            columnStyles: {
        0: { cellWidth: 20 }, // Posición (más angosto)
        1: { cellWidth: 20 }, // Usuario
        2: { cellWidth: 18 }, // R32   GRUPOS
        3: { cellWidth: 18 }, // R16   DIECISEISAVOS
        4: { cellWidth: 18 }, // QF   OCTAVOS
        5: { cellWidth: 18 }, // SF   CUARTOS
        6: { cellWidth: 14 }, // Final SEMIS
        7: { cellWidth: 18 }, // Campeón
        8: { cellWidth: 15, fontStyle: 'bold' } // Total
    },
        // AGREGAR para forzar una sola página si es posible:
        margin: {  right: 10, bottom: 20, left: 20 },
        pageBreak: 'auto', // Evitar saltos de página
        didDrawPage: function (data: any) {
                // Pie de página
                doc.setFontSize(9);
                // const pageCount = doc.internal.getNumberOfPages();
                const pageCount = (doc as any).internal.getNumberOfPages();
                const pageHeight = doc.internal.pageSize.height;
                doc.text(`Página ${data.pageNumber} de ${pageCount}`, 14, pageHeight - 10);
            }
        }
    );
        
        // Agregar metadata
        doc.setProperties({
            title: title,
            subject: 'Ranking de predicciones - Mundial 2026',
            author: 'Sistema de Quiniela Mundial 2026'
        });
        
        // Guardar archivo
        doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${date.replace(/\//g, '-')}.pdf`);
        
    } catch (error) {
        console.error('Error exportando ranking a PDF:', error);
        throw new Error('Error al generar el PDF del ranking');
    }
};


export const exportPredictionToPDF = async (
    element: HTMLElement,
    predictionData: PredictionData,
    html2canvas: any
): Promise<void> => {
    try {
        if (!element) {
            throw new Error('Elemento no encontrado para capturar');
        }

        // Guardar estilos originales
        const originalWidth = element.style.width;
        const originalHeight = element.style.height;
        
        // Agrandar temporalmente
        element.style.width = '1600px';
        element.style.height = 'auto';
        element.classList.remove('hidden');
        
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capturar
        const canvas = await html2canvas(element, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Restaurar
        element.style.width = originalWidth;
        element.style.height = originalHeight;
        element.classList.add('hidden');

        // Crear PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calcular escala para ancho completo
        const widthScale = pdfWidth / imgWidth;
        const totalHeight = imgHeight * widthScale;
        
        // Si es más alto que una página, usar múltiples páginas
        let yPosition = 0;
        let remainingHeight = totalHeight;
        let firstPage = true;
        
        while (remainingHeight > 0) {
            if (!firstPage) {
                pdf.addPage();
            }
            
            const currentY = -yPosition * widthScale;
            pdf.addImage(imgData, 'JPEG', 0, currentY, pdfWidth, totalHeight);
            
            yPosition += pdfHeight / widthScale;
            remainingHeight -= pdfHeight;
            firstPage = false;
        }

        pdf.save(`quiniela-${predictionData.userName}-${Date.now()}.pdf`);

    } catch (error) {
        console.error('Error generando PDF:', error);
        throw error;
    }
};
/**
 * Exporta datos simples a PDF (versión simplificada)
 */
export const exportSimpleTableToPDF = (
    headers: string[],
    rows: any[][],
    title: string = 'Reporte'
): void => {
    try {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(16);
        doc.text(title, 14, 22);
        
        // Crear tabla
        autoTable(doc, {
            startY: 30,
            head: [headers],
            body: rows,
            theme: 'grid'
        });
        
        doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
        
    } catch (error) {
        console.error('Error exportando tabla a PDF:', error);
        throw new Error('Error al generar el PDF');
    }
};