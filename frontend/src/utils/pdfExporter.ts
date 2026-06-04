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
    // ... otros campos que uses en el bracket
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
            startY: 45,
            head: [
                ['Posición', 'Usuario', 'R32', 'R16', 'QF', 'SF', 'Final', 'Campeón', 'Total']
            ],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185], // Azul
                textColor: 255
            },
            // styles: {
            //     fontSize: 9,
            //     cellPadding: 3
            // },
            styles: {
        fontSize: 8, // Reducir tamaño de fuente
        cellPadding: 2, // Reducir padding
        overflow: 'linebreak' // Ajustar texto largo
    },
            // columnStyles: {
            //     0: { cellWidth: 20 }, // Posición
            //     1: { cellWidth: 25 }, // Usuario
            //     8: { fontStyle: 'bold' } // Total
            // },
            columnStyles: {
        0: { cellWidth: 15 }, // Posición (más angosto)
        1: { cellWidth: 20 }, // Usuario
        2: { cellWidth: 12 }, // R32
        3: { cellWidth: 12 }, // R16
        4: { cellWidth: 12 }, // QF
        5: { cellWidth: 12 }, // SF
        6: { cellWidth: 12 }, // Final
        7: { cellWidth: 15 }, // Campeón
        8: { cellWidth: 15, fontStyle: 'bold' } // Total
    },
        // AGREGA para forzar una sola página si es posible:
        margin: { top: 45, right: 10, bottom: 20, left: 10 },
        pageBreak: 'avoid', // Evitar saltos de página
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

/**
 * Exporta predicción individual (bracket) a PDF
 * Necesita html2canvas para capturar el elemento DOM
 */
export const exportPredictionToPDF = async (
    element: HTMLElement,
    predictionData: PredictionData,
    html2canvas: any // Pasar html2canvas como dependencia
): Promise<void> => {
    try {
        if (!element) {
            throw new Error('Elemento no encontrado para capturar');
        }
        
        // 1. Capturar el bracket como imagen
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        // 2. Crear PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // 3. Calcular dimensiones
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
        
        // 4. Agregar imagen al PDF
        pdf.addImage(
            imgData, 
            'PNG', 
            (pdfWidth - imgWidth * ratio) / 2,
            (pdfHeight - imgHeight * ratio) / 2,
            imgWidth * ratio,
            imgHeight * ratio
        );
        
        // 5. Agregar metadata
        pdf.setProperties({
            title: `Quiniela Mundial 2026 - ${predictionData.userName}`,
            subject: 'Predicción Mundial FIFA 2026',
            author: 'Quiniela Mundial 2026'
        });
        
        // 6. Descargar
        pdf.save(`quiniela-${predictionData.userName}-${new Date().getTime()}.pdf`);
        
    } catch (error) {
        console.error('Error generando PDF de predicción:', error);
        throw new Error('Error al generar el PDF de la predicción');
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