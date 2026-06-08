import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UserReportData {
    user_code: string;
    qualified_teams: string[];
    knockout_predictions: {
        roundOf32?: string[];
        roundOf16?: string[];
        quarterFinals?: string[];
        semiFinals?: string[];
        final?: { champion: string; runnerUp: string };
    } | null;
}

export const generateFullReportPDF = async (usersData: UserReportData[]) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });

// TÍTULO PRINCIPAL
doc.setFontSize(16);
doc.setFont('helvetica', 'bold');
doc.text('Quiniela Mundialista 2026 - Resumen de Quinielas', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
doc.setFontSize(10);
doc.setFont('helvetica', 'normal');
doc.text(`Generado: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
    // ========== PÁGINA 1: FASE DE GRUPOS ==========
    // Datos de la tabla
    doc.setFontSize(12);
doc.setFont('helvetica', 'bold');
doc.text('1. Fase de Grupos', 10, 35);
    const groupBody = usersData.map(user => [
        user.user_code,
        ...(user.qualified_teams?.slice(0, 24) || Array(24).fill('')),
        ...(user.qualified_teams?.slice(24, 32) || Array(8).fill(''))
    ]);
    
    // Configuración de tabla de grupos
    autoTable(doc, {
        startY: 40,
        tableWidth: 'auto',  // ← Cambiar a 'auto' para que ocupe todo el ancho
        head: [['Usuario', ...Array(32).fill('')]],
        body: groupBody,
        styles: { fontSize: 7, cellPadding: .8, overflow: 'linebreak', halign: 'center' },
        headStyles: { fillColor: [52, 73, 94], textColor: 255, fontSize: 8, halign: 'center' },
        columnStyles: {
            0: { cellWidth: 15, fontStyle: 'bold' }
        },
        margin: { left: 5, right: 5 },
        didParseCell: (data) => {
            // Primera fila (encabezado principal)
            if (data.section === 'head' && data.row.index === 0) {
                // Columna 0: Usuario
                if (data.column.index === 0) {
                    data.cell.text = ['Usuario'];
                }
                // Columnas 1-24: GRUPOS
                else if (data.column.index >= 1 && data.column.index <= 24) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [41, 128, 185];
                    data.cell.styles.textColor = 255;
                    if (data.column.index === 1) {
                        data.cell.colSpan = 24;
                        data.cell.text = ['GRUPOS (24)'];
                        data.cell.styles.halign = 'center';
                    }
                }
                // Columnas 25-32: TERCEROS
                else if (data.column.index >= 25 && data.column.index <= 32) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [46, 204, 113];
                    data.cell.styles.textColor = 255;
                    if (data.column.index === 25) {
                        data.cell.colSpan = 8;
                        data.cell.text = ['TERCEROS (8)'];
                        data.cell.styles.halign = 'center';
                    }
                }
            }
            // Ajustar ancho de columnas de equipos
            if (data.section === 'body' && data.column.index > 0) {
                data.cell.styles.cellWidth = 7.5;
            }
        }
    });
    
    // ========== PÁGINA 2: KNOCKOUT ==========
    doc.addPage();
    // Subtítulo página 2
doc.setFontSize(12);
doc.setFont('helvetica', 'bold');
doc.text('2. Fase de Eliminación Directa', 10, 25);
    // Preparar datos de knockout
    const knockoutBody = usersData.map(user => {
        const ko = user.knockout_predictions;
        if (!ko) return [user.user_code, ...Array(31).fill('')];
        
        const round32 = ko.roundOf32 || [];
        const round16 = ko.roundOf16 || [];
        const quarter = ko.quarterFinals || [];
        const semi = ko.semiFinals || [];
        const champion = ko.final?.champion || '';
        
        return [
            user.user_code,
            ...round32.slice(0, 16),
            ...round16.slice(0, 8),
            ...quarter.slice(0, 4),
            ...semi.slice(0, 2),
            champion
        ];
    });
    
    // Configuración de tabla de knockout
    autoTable(doc, {
        startY: 30,
        head: [['Usuario', ...Array(31).fill('')]],
        body: knockoutBody,
        styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
        headStyles: { fillColor: [52, 73, 94], textColor: 255, fontSize: 8, halign: 'center' },
        columnStyles: {
            0: { cellWidth: 15, fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            // Primera fila (encabezado principal)
            if (data.section === 'head' && data.row.index === 0) {
                if (data.column.index === 0) {
                    data.cell.text = ['Usuario'];
                }
                // Columnas 1-16: DIECISEISAVOS
                else if (data.column.index >= 1 && data.column.index <= 16) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [155, 89, 182];
                    data.cell.styles.textColor = 255;
                    if (data.column.index === 1) {
                        data.cell.colSpan = 16;
                        data.cell.text = ['DIECISEISAVOS (16)'];
                        data.cell.styles.halign = 'center';
                    }
                }
                // Columnas 17-24: OCTAVOS
                else if (data.column.index >= 17 && data.column.index <= 24) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [52, 152, 219];
                    data.cell.styles.textColor = 255;
                    if (data.column.index === 17) {
                        data.cell.colSpan = 8;
                        data.cell.text = ['OCTAVOS (8)'];
                        data.cell.styles.halign = 'center';
                    }
                }
                // Columnas 25-28: CUARTOS
                else if (data.column.index >= 25 && data.column.index <= 28) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [241, 148, 138];
                    data.cell.styles.textColor = 255;
                    if (data.column.index === 25) {
                        data.cell.colSpan = 4;
                        data.cell.text = ['CUARTOS (4)'];
                        data.cell.styles.halign = 'center';
                    }
                }
                // Columnas 29-30: SEMIFINALES
                else if (data.column.index >= 29 && data.column.index <= 30) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [230, 126, 34];
                    data.cell.styles.textColor = 255;
                    if (data.column.index === 29) {
                        data.cell.colSpan = 2;
                        data.cell.text = ['SEMIFINALES (2)'];
                        data.cell.styles.halign = 'center';
                    }
                }
                // Columna 31: FINAL
                else if (data.column.index === 31) {
                    data.cell.text = [''];
                    data.cell.styles.fillColor = [231, 76, 60];
                    data.cell.styles.textColor = 255;
                    data.cell.colSpan = 1;
                    data.cell.text = ['FINAL'];
                    data.cell.styles.halign = 'center';
                }
            }
            // Ajustar ancho de columnas
            if (data.section === 'body' && data.column.index > 0) {
                data.cell.styles.cellWidth = 7.5;
            }
        }
    });
    
    // Guardar PDF
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}`;
    doc.save(`resumen_quinielas_${dateStr}.pdf`);
};