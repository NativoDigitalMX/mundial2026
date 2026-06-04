import React, { useRef } from 'react';
import type { UserPrediction, Group, Team } from '../types/tournament';
import { Trophy, Download, Copy, LogOut,  ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { exportPredictionToPDF} from '../utils/pdfExporter';

interface ResultsViewProps {
    prediction: UserPrediction;
    groups: Group[];
    onReset: () => void;
    onFinish: () => void;
    isAuthenticated?: boolean;
    saveMessage?: string;
    userCode?: string; 
}
const ResultsView: React.FC<ResultsViewProps> = ({
    prediction,
    onFinish,
    isAuthenticated,
    userCode 
}) => {
    const bracketRef = useRef<HTMLDivElement>(null);
    // Función para copiar el bracket como texto
    const handleCopyBracket = () => {
        let bracketText = `⚽ QUINIELA MUNDIAL 2026\n`;
        bracketText += `👤 ${prediction.userName}\n`;
        bracketText += `📅 ${new Date(prediction.timestamp).toLocaleDateString()}\n\n`;

        bracketText += `🏆 CAMPEÓN: ${prediction.knockoutPredictions.champion?.name || 'N/A'}\n`;
        bracketText += `🥈 SUBCAMPEÓN: ${prediction.knockoutPredictions.runnerUp?.name || 'N/A'}\n`;
        bracketText += `🥉 TERCER LUGAR: ${prediction.knockoutPredictions.thirdPlace?.name || 'N/A'}\n\n`;

        bracketText += `📊 FASES ELIMINATORIAS:\n`;
        // Round of 32
        bracketText += `\n🔹 DIECISEISAVOS (32):\n`;
        prediction.knockoutPredictions.roundOf32.forEach((team, idx) => {
            if (team) bracketText += `  Partido ${idx + 73}: ${team.name} (${team.code})\n`;
        });
        // Round of 16
        bracketText += `\n🔸 OCTAVOS (16):\n`;
        prediction.knockoutPredictions.roundOf16.forEach((team, idx) => {
            if (team) bracketText += `  Partido ${idx + 89}: ${team.name} (${team.code})\n`;
        });
        // Quarter finals
        bracketText += `\n🔹 CUARTOS (8):\n`;
        prediction.knockoutPredictions.quarterFinals.forEach((team, idx) => {
            if (team) bracketText += `  Partido ${idx + 97}: ${team.name} (${team.code})\n`;
        });
        // Semi finals
        bracketText += `\n🔸 SEMIFINALES (4):\n`;
        prediction.knockoutPredictions.semiFinals.forEach((team, idx) => {
            if (team) bracketText += `  Partido ${idx + 101}: ${team.name} (${team.code})\n`;
        });
        navigator.clipboard.writeText(bracketText).then(() => {
            alert('¡Bracket copiado al portapapeles!');
        });
    };

    const handleDownloadPDF = async () => {
        const pdfElement = document.getElementById('pdf-bracket');
        if (!pdfElement) return;

        try {
            // ✅ 1. Mostrar el elemento TEMPORALMENTE
            pdfElement.classList.remove('hidden');

            // ✅ 2. Forzar un reflow para que el navegador renderice
            pdfElement.offsetHeight;

            const predictionData = {
                userName: prediction.userName
            };

            // ✅ 3. Exportar con el elemento visible
            await exportPredictionToPDF(pdfElement, predictionData, html2canvas);

            // ✅ 4. Ocultar nuevamente
            pdfElement.classList.add('hidden');

            alert('PDF generado exitosamente');

        } catch (error) {
            // ✅ 5. Asegurar que se oculte incluso si hay error
            pdfElement.classList.add('hidden');
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Error al generar el PDF.');
        }
    };
    const handleDownloadImage = async () => {
        const pdfElement = document.getElementById('pdf-bracket');
        if (!pdfElement) return;
        try {
            // ✅ 1. Mostrar el elemento TEMPORALMENTE
            pdfElement.classList.remove('hidden');

            // ✅ 2. Forzar un reflow
            pdfElement.offsetHeight;

            // ✅ 3. Capturar como imagen
            const canvas = await html2canvas(pdfElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // ✅ 4. Ocultar nuevamente
            pdfElement.classList.add('hidden');

            // ✅ 5. Descargar PNG
            const link = document.createElement('a');
            link.download = `quiniela-${prediction.userName}-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            alert('Imagen generada exitosamente');

        } catch (error) {
            // ✅ 6. Asegurar que se oculte incluso si hay error
            pdfElement?.classList.add('hidden');
            console.error('Error generando imagen:', error);
            alert('Error al generar la imagen. Intenta nuevamente.');
        }
    };
    const TeamCell = ({ team, matchNumber, isWinner = false }: {
        team: Team | null,
        matchNumber?: number,
        isWinner?: boolean
    }) => (
        <div className={`p-3 rounded-lg border ${isWinner ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-300' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded ${isWinner ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {team?.code || '--'}
                    </div>
                    <div>
                        <div className={`font-medium ${isWinner ? 'text-green-800' : 'text-gray-700'}`}>
                            {team?.name || 'Por definir'}
                        </div>
                        {matchNumber && (
                            <div className="text-xs text-gray-500">Partido {matchNumber}</div>
                        )}
                    </div>
                </div>
                {isWinner && (
                    <ChevronRight className="h-4 w-4 text-green-600" />
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Encabezado con iniciales */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Copa Mundial de Futbol 2026
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full text-white font-bold">
                            {userCode}
                         
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-gray-800">{prediction.userName}</div>
                            <div className="text-sm text-gray-500">
                                {new Date(prediction.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BRACKET PRINCIPAL - DISEÑO DE COLUMNAS */}
                <div className="relative">
                    {/* Vista para pantalla (responsive) */}
                    <div ref={bracketRef} className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-8 overflow-x-auto">
                        <div className="text-center mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Quiniela de {userCode || null}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Mundial FIFA 2026 • {new Date(prediction.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                        {/* Títulos de columnas - solo visible en desktop */}
                        <div className="hidden md:grid grid-cols-5 gap-4 mb-8 border-b pb-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-700">DIECISEISAVOS</div>
                                <div className="text-sm text-gray-500">16 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-indigo-700">OCTAVOS</div>
                                <div className="text-sm text-gray-500">8 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-amber-700">CUARTOS</div>
                                <div className="text-sm text-gray-500">4 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-red-700">SEMIFINALES</div>
                                <div className="text-sm text-gray-500">2 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-yellow-600">CAMPEÓN</div>
                                <div className="text-sm text-gray-500">🏆</div>
                            </div>
                        </div>

                        {/* Contenido del bracket - responsive */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 min-h-[600px]">
                            {/* Columna 1: Dieciseisavos (32) */}
                            <div className="space-y-2 md:space-y-2">
                                <div className="md:hidden text-lg font-bold text-purple-700 border-b pb-2 mb-2">
                                    🏆 DIECISEISAVOS (32)
                                </div>
                                {prediction.knockoutPredictions.roundOf32.map((team, idx) => (
                                    <div key={idx} className="mb-1">
                                        <TeamCell team={team} matchNumber={73 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 2: Octavos (16) */}
                            <div className="space-y-8 md:space-y-8">
                                <div className="md:hidden text-lg font-bold text-indigo-700 border-b pb-2 mb-2">
                                    ⚽ OCTAVOS (16)
                                </div>
                                {prediction.knockoutPredictions.roundOf16.map((team, idx) => (
                                    <div key={idx} className={`${idx % 2 === 0 ? 'md:mt-12' : ''} ${idx === 0 ? 'mt-0' : 'mt-4'}`}>
                                        <TeamCell team={team} matchNumber={89 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 3: Cuartos (8) */}
                            <div className="space-y-16 md:space-y-16">
                                <div className="md:hidden text-lg font-bold text-amber-700 border-b pb-2 mb-2">
                                    🎯 CUARTOS (8)
                                </div>
                                {prediction.knockoutPredictions.quarterFinals.map((team, idx) => (
                                    <div key={idx} className={`${idx === 0 ? 'md:mt-24' : idx === 1 ? 'md:mt-8' : idx === 2 ? 'md:mt-32' : 'md:mt-16'
                                        } ${idx > 0 ? 'mt-4' : 'mt-0'}`}>
                                        <TeamCell team={team} matchNumber={97 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 4: Semifinales (4) */}
                            <div className="space-y-32 md:space-y-32">
                                <div className="md:hidden text-lg font-bold text-red-700 border-b pb-2 mb-2">
                                    🔥 SEMIFINALES (4)
                                </div>
                                {prediction.knockoutPredictions.semiFinals.map((team, idx) => (
                                    <div key={idx} className={`${idx === 0 ? 'md:mt-40' : 'md:mt-48'} ${idx > 0 ? 'mt-4' : 'mt-0'}`}>
                                        <TeamCell team={team} matchNumber={101 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 5: Campeón (2) */}
                            <div className="pt-0 md:pt-12">
                                <div className="md:hidden text-lg font-bold text-yellow-600 border-b pb-2 mb-2">
                                    🏆 CAMPEÓN
                                </div>
                                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border-2 border-yellow-300 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <span className="font-bold text-amber-800">CAMPEÓN</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-800">
                                        {prediction.knockoutPredictions.champion?.name || '--'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {prediction.knockoutPredictions.champion?.code || ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vista para PDF (siempre desktop, oculta en pantalla) */}
                    <div id="pdf-bracket" className="hidden bg-white p-6 w-[1200px]">
                        <div className="text-center mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Quiniela de {userCode || null}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Mundial FIFA 2026 • {new Date(prediction.timestamp).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Títulos de columnas - siempre visibles en PDF */}
                        <div className="grid grid-cols-5 gap-4 mb-8 border-b pb-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-700">DIECISEISAVOS</div>
                                <div className="text-sm text-gray-500">16 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-indigo-700">OCTAVOS</div>
                                <div className="text-sm text-gray-500">8 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-amber-700">CUARTOS</div>
                                <div className="text-sm text-gray-500">4 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-red-700">SEMIFINALES</div>
                                <div className="text-sm text-gray-500">2 equipos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-yellow-600">CAMPEÓN</div>
                                <div className="text-sm text-gray-500">🏆</div>
                            </div>
                        </div>

                        {/* Grid de 5 columnas - siempre desktop */}
                        <div className="grid grid-cols-5 gap-4">
                            {/* Columna 1: Dieciseisavos */}
                            <div className="space-y-2">
                                {prediction.knockoutPredictions.roundOf32.map((team, idx) => (
                                    <div key={idx} className="mb-1">
                                        <TeamCell team={team} matchNumber={73 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 2: Octavos */}
                            <div className="space-y-8">
                                {prediction.knockoutPredictions.roundOf16.map((team, idx) => (
                                    <div key={idx} className={idx % 2 === 0 ? 'mt-12' : ''}>
                                        <TeamCell team={team} matchNumber={89 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 3: Cuartos */}
                            <div className="space-y-16">
                                {prediction.knockoutPredictions.quarterFinals.map((team, idx) => (
                                    <div key={idx} className={
                                        idx === 0 ? 'mt-24' : idx === 1 ? 'mt-8' : idx === 2 ? 'mt-32' : 'mt-16'
                                    }>
                                        <TeamCell team={team} matchNumber={97 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 4: Semifinales */}
                            <div className="space-y-32">
                                {prediction.knockoutPredictions.semiFinals.map((team, idx) => (
                                    <div key={idx} className={idx === 0 ? 'mt-40' : 'mt-48'}>
                                        <TeamCell team={team} matchNumber={101 + idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Columna 5: Campeón */}
                            <div className="pt-12">
                                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border-2 border-yellow-300 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <span className="font-bold text-amber-800">CAMPEÓN</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-800">
                                        {prediction.knockoutPredictions.champion?.name || '--'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {prediction.knockoutPredictions.champion?.code || ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sección de Acciones */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl shadow-xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        💾 Exportar tu Predicción
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Copiar Bracket */}
                        <button
                            onClick={handleCopyBracket}
                            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Copy className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900">Copiar Bracket</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Copia tu predicción completa como texto
                                </div>
                            </div>
                        </button>


                        {/* Descargar Imagen (placeholder) */}
                        <button
                            onClick={handleDownloadImage}
                            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Download className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900">Descargar Imagen</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    PNG de alta calidad
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-red-200 hover:border-red-400 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 bg-red-100 rounded-lg">
                                <span className="text-xl">📄</span>
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900">Descargar PDF</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Documento listo para imprimir
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Botón Final */}
                <div className="text-center">
                    <div className="inline-block p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-8">
                        <button
                            onClick={onFinish}
                            // disabled={!(isAuthenticated && saveMessage?.includes('✅'))}
                            disabled={!isAuthenticated }
                            className={`px-12 py-5 bg-white text-gray-900 text-xl font-bold rounded-xl hover:shadow-lg transition-all ${!(isAuthenticated ) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="h-6 w-6" />
                                <span>Terminar y Salir</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
    );
};

export default ResultsView;