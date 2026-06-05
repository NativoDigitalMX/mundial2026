import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';
import { exportSimpleTableToPDF } from '../utils/pdfExporter';
interface User {
    id: number;
    user_code: string;
    full_name: string;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [predictionsStatus, setPredictionsStatus] = useState<Record<number, boolean>>({});
    const [tableKey, setTableKey] = useState(Date.now());
    // Estado para formulario de nuevo/editar usuario
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        user_code: '',
        full_name: '',
        password: '',
        is_admin: false,
        is_active: true
    });

    const [showSimpleList, setShowSimpleList] = useState(false);

    // Cargar usuarios
    const loadUsers = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError("No hay token de autenticación");
                setLoading(false)
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const result = await response.json();
            // IMPORTANTE: Extraer el array de "users"
            const usersData = result.users || [];
            setUsers(usersData);
            setLoading(false); // ✅ Termina carga de usuarios
        } catch (err: any) {
            setError(err.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);
    useEffect(() => {
        // Forzar actualización de la tabla cuando cambien los datos
        setTableKey(Date.now());
    }, [users, predictionsStatus]);
    useEffect(() => {
        if (users.length > 0) {
            checkAllPredictions(users);
        }
    }, [users]); // Se ejecuta cuando users cambia
    
    // Manejar envío de formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const url = editingUser
                ? `${API_BASE_URL}/admin/users/${editingUser.id}`
                : `${API_BASE_URL}/admin/users`;

            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al guardar usuario');

            // Recargar lista y limpiar formulario
            await loadUsers();
            handleCancel();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Cancelar formulario
    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData({
            user_code: '',
            full_name: '',
            password: '',
            is_admin: false,
            is_active: true
        });
    };

    // Manejar editar usuario
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            user_code: user.user_code,
            full_name: user.full_name,
            password: '', // Dejar vacío para no cambiar contraseña
            is_admin: user.is_admin,
            is_active: user.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (userId: number) => {
        try {
            // Iniciando eliminación del usuario ID: ${userId}
            const token = sessionStorage.getItem('token');

            // PRIMERO: Intentar eliminar directamente
            const deleteResponse = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ delete_predictions: false })
            });

            const result = await deleteResponse.json();

            // Si el error es USER_HAS_PREDICTIONS, mostrar confirmación especial
            if (!deleteResponse.ok && result.error === 'USER_HAS_PREDICTIONS') {

                const predictionCount = result.prediction_count || 'varias';
                const userCode = result.user_code || users.find(u => u.id === userId)?.user_code || `ID: ${userId}`;

                const confirmDelete = window.confirm(
                    `⚠️ ATENCIÓN: El usuario ${userCode} tiene ${predictionCount} predicción(es) asociada(s).\n\n` +
                    `Si elimina al usuario, también se eliminarán todas sus predicciones.\n\n` +
                    `¿Desea eliminar al usuario ${userCode} y sus ${predictionCount} predicción(es)?`
                );

                if (!confirmDelete) return;

                // Segunda llamada para eliminar con predicciones
                const deleteWithPredictionsResponse = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ delete_predictions: true })
                });

                const deleteWithPredictionsResult = await deleteWithPredictionsResponse.json();

                if (!deleteWithPredictionsResponse.ok) {
                    throw new Error(deleteWithPredictionsResult.error || deleteWithPredictionsResult.message);
                }

                await loadUsers();
                alert(`Usuario ${userCode} y sus ${predictionCount} predicción(es) eliminados correctamente.`);

            } else if (!deleteResponse.ok) {
                // Otro tipo de error
                throw new Error(result.error || result.message || `Error ${deleteResponse.status}`);

            } else {
                // Éxito sin predicciones
                const userCode = users.find(u => u.id === userId)?.user_code || '';
                await loadUsers();
                alert(`Usuario ${userCode} eliminado correctamente.`);
            }

        } catch (err: any) {
            console.error('Error eliminando:', err);
            alert(`Error: ${err.message}`);
        }
    };
    const showPredictionModal = (prediction: any) => {
        // Crear modal mejorado
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

        // Formatear los datos para visualización
        const formatGroupPredictions = () => {
            if (!prediction.group_predictions) return '<p>No hay predicciones de grupos</p>';

            let html = '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">';

            Object.entries(prediction.group_predictions).forEach(([group, data]: [string, any]) => {
                // Buscar si este grupo tiene un mejor tercer lugar seleccionado
                const thirdPlaceEntry = prediction.third_place_selections?.find(
                    (tp: any) => tp.group === group
                );
                const thirdPlaceTeam = thirdPlaceEntry ? thirdPlaceEntry.team_code : null;

                html += `
        <div class="bg-gray-50 p-4 rounded-lg border ${thirdPlaceTeam ? 'border-green-300 bg-green-50' : ''}">
          <h4 class="font-bold text-lg mb-2 text-center">Grupo ${group}</h4>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="font-medium">🥇 1ro:</span>
              <span class="font-bold">${data.first || '-'}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">🥈 2do:</span>
              <span class="font-bold">${data.second || '-'}</span>
            </div>
            <div class="flex justify-between ${thirdPlaceTeam ? 'bg-green-100 p-1 rounded font-bold' : ''}">
              <span class="font-medium">🥉 3ro:</span>
              <span class="font-bold ${thirdPlaceTeam ? 'text-green-700' : ''}">
                ${data.third || '-'}
                ${thirdPlaceTeam ? ' ⭐' : ''}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">4to:</span>
              <span>${data.fourth || '-'}</span>
            </div>
            ${thirdPlaceTeam ? `
            <div class="mt-2 pt-2 border-t border-green-200 text-xs text-green-700 font-medium">
              ✅ Mejor tercero: ${thirdPlaceTeam} (${thirdPlaceEntry.team_name})
            </div>
            ` : ''}
          </div>
        </div>
      `;
            });

            html += '</div>';

            // Sección de resumen de mejores terceros 
            if (prediction.third_place_selections && prediction.third_place_selections.length > 0) {
                html += `
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 class="font-bold text-md mb-3 flex items-center">
            <span class="text-xl mr-2">⭐</span> Mejores Terceros Lugares Clasificados
          </h5>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${prediction.third_place_selections.map((tp: any) => `
              <div class="bg-white p-2 rounded border border-blue-200 text-center">
                <span class="font-mono font-bold text-blue-700">${tp.team_code}</span>
                <span class="text-xs text-gray-500 block">Grupo ${tp.group}</span>
                <span class="text-xs text-gray-400">${tp.team_name}</span>
              </div>
            `).join('')}
          </div>
          <div class="mt-2 text-xs text-gray-600">
            Total: ${prediction.third_place_selections.length} de 8 mejores terceros
          </div>
        </div>
        `;
            }

            return html;
        };
        const formatKnockoutPredictions = () => {
            if (!prediction.knockout_predictions && !prediction.formatted_knockout) {
                return '<p>No hay predicciones de eliminatoria</p>';
            }

            const ko = prediction.formatted_knockout || prediction.knockout_predictions;
            return `
    <div class="space-y-6">
      ${ko.roundOf32 && ko.roundOf32.length > 0 ? `
        <div>
          <h5 class="font-bold mb-2 text-lg">🏆 Ronda de 32 (16avos):</h5>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${ko.roundOf32.map((team: string) =>
                team ? `<div class="bg-gray-100 p-2 rounded text-center">${team}</div>` : ''
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      ${ko.roundOf16 && ko.roundOf16.length > 0 ? `
        <div>
          <h5 class="font-bold mb-2 text-lg">⚽ Octavos de Final:</h5>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${ko.roundOf16.map((team: string) =>
                team ? `<div class="bg-blue-50 p-2 rounded text-center border border-blue-200">${team}</div>` : ''
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      ${ko.quarterFinals && ko.quarterFinals.length > 0 ? `
        <div>
          <h5 class="font-bold mb-2 text-lg">🎯 Cuartos de Final:</h5>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            ${ko.quarterFinals.map((team: string) =>
                team ? `<div class="bg-purple-50 p-2 rounded text-center border border-purple-200">${team}</div>` : ''
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      ${ko.semiFinals && ko.semiFinals.length > 0 ? `
        <div>
          <h5 class="font-bold mb-2 text-lg">🔥 Semifinales:</h5>
          <div class="grid grid-cols-2 gap-2">
            ${ko.semiFinals.map((team: string) =>
                team ? `<div class="bg-orange-50 p-3 rounded text-center border border-orange-200 font-bold">${team}</div>` : ''
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        ${ko.thirdPlace ? `
          <div>
            <h5 class="font-bold mb-2">🥉 Tercer Lugar:</h5>
            <div class="bg-gray-100 p-4 rounded text-center font-bold">
              ${ko.thirdPlace}
            </div>
          </div>
        ` : ''}
        
        ${ko.final.champion ? `
          <div>
            <h5 class="font-bold mb-2">🥈 Campeon:</h5>
            <div class="bg-gray-100 p-4 rounded text-center font-bold text-lg">
              ${ko.final.champion}
            </div>
          </div>
        ` : ''}
        
        ${ko.champion ? `
          <div class="${ko.thirdPlace ? 'md:col-span-1' : 'md:col-span-2'}">
            <h5 class="font-bold mb-2">🏆 CAMPEÓN:</h5>
            <div class="bg-yellow-100 p-4 rounded text-center font-bold text-xl border-2 border-yellow-300">
              ${ko.champion}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
        };

        modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold">
              🏆 Predicción de ${prediction.user_code}
            </h2>
            <p class="text-blue-100">${prediction.full_name}</p>
            <p class="text-sm text-blue-200">
              Enviada: ${new Date(prediction.submitted_at).toLocaleDateString('es-ES')}
            </p>
          </div>
          <button onclick="this.closest('.fixed').remove()" 
                  class="text-white hover:text-blue-200 text-3xl">
            &times;
          </button>
        </div>
      </div>
      
      <!-- Puntuación -->
      <div class="p-6 border-b">
        <h3 class="font-bold text-lg mb-4">📊 Puntuación Obtenida:</h3>
        <div class="grid grid-cols-3 md:grid-cols-7 gap-3">
          <div class="bg-green-50 p-3 rounded text-center border border-green-200">
            <div class="text-xs text-green-600 font-medium">Grupos</div>
            <div class="text-xl font-bold">${prediction.points.round_of_32 || 0}</div>
          </div>
          <div class="bg-purple-50 p-3 rounded text-center border border-purple-200">
            <div class="text-xs text-purple-600 font-medium">16avos</div>
            <div class="text-xl font-bold">${prediction.points.round_of_16 || 0}</div>
          </div>
          <div class="bg-yellow-50 p-3 rounded text-center border border-yellow-200">
            <div class="text-xs text-yellow-600 font-medium">Octavos</div>
            <div class="text-xl font-bold">${prediction.points.quarter_finals || 0}</div>
          </div>
          <div class="bg-orange-50 p-3 rounded text-center border border-orange-200">
            <div class="text-xs text-orange-600 font-medium">Cuartos</div>
            <div class="text-xl font-bold">${prediction.points.semi_finals || 0}</div>
          </div>
          
          <div class="bg-red-50 p-3 rounded text-center border border-red-200">
            <div class="text-xs text-red-600 font-medium">Semis</div>
            <div class="text-xl font-bold">${prediction.points.final || 0}</div>
          </div>
          <div class="bg-red-50 p-3 rounded text-center border border-red-200">
            <div class="text-xs text-red-600 font-medium">Campeon</div>
            <div class="text-xl font-bold">${prediction.points.champion || 0}</div>
          </div>
          <div class="bg-gray-100 p-3 rounded text-center border border-gray-300">
            <div class="text-xs text-gray-700 font-medium">TOTAL</div>
            <div class="text-2xl font-bold">${prediction.points.total || 0}</div>
          </div>
        </div>
      </div>
      
      <!-- Contenido con tabs -->
      <div class="flex-1 overflow-auto">
        <div class="border-b">
          <div class="flex">
            <button class="tab-button active px-6 py-3 font-medium border-b-2 border-blue-500 text-blue-600" 
                    data-tab="groups">
              👥 Fase de Grupos
            </button>
            <button class="tab-button px-6 py-3 font-medium text-gray-500 hover:text-gray-700" 
                    data-tab="knockout">
              ⚽ Fase Eliminatoria
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Tab Grupos -->
          <div id="tab-groups" class="tab-content">
            <h4 class="font-bold text-lg mb-4">Predicciones por Grupo:</h4>
            <p class="text-sm text-lg-200 mt-1">
    ⭐ Mejores terceros: ${prediction.third_place_selections?.length || 0}/8
</p>
            ${formatGroupPredictions()}
          </div>
          
          <!-- Tab Eliminatoria -->
          <div id="tab-knockout" class="tab-content hidden">
            <h4 class="font-bold text-lg mb-4">Predicciones Eliminatoria:</h4>
            ${formatKnockoutPredictions()}
          </div>
        
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t p-6 bg-gray-50 flex justify-between">
        <div class="text-sm text-gray-500">
          ID: ${prediction.id} • User ID: ${prediction.user_id}
        </div>
        <div class="space-x-3">
          <button onclick="window.print()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            🖨️ Imprimir
          </button>
          <button onclick="this.closest('.fixed').remove()" 
                  class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;

        document.body.appendChild(modal);

        // Funcionalidad de tabs
        modal.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = (e.target as HTMLElement).getAttribute('data-tab');

                // Actualizar botones activos
                modal.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
                    btn.classList.add('text-gray-500');
                });
                (e.target as HTMLElement).classList.add('active', 'border-blue-500', 'text-blue-600');
                (e.target as HTMLElement).classList.remove('text-gray-500');

                // Mostrar contenido correspondiente
                modal.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                modal.querySelector(`#tab-${targetTab}`)?.classList.remove('hidden');
            });
        });

        // Cerrar con Escape
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') modal.remove();
        };
        document.addEventListener('keydown', handleEscape);

        // Limpiar event listener al cerrar
        modal.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).classList.contains('fixed')) {
                modal.remove();
            }
        });
    }; 
    // Función para verificar si un usuario tiene predicción
    const hasPrediction = async (userId: number) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/prediction`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 404) {
                return false;
            }

            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            return data.hasPrediction || !!data.prediction || false;
        } catch (error) {
            return false;
        }
    };
    
    // Función para verificar todas las predicciones
    const checkAllPredictions = async (usersList: any[]) => {
        setLoadingPredictions(true);
        const predictions: Record<number, boolean> = {};
        for (const user of usersList) {
            const hasPred = await hasPrediction( user.id);
            predictions[user.id] = hasPred;
        }
        setPredictionsStatus(predictions);
        setLoadingPredictions(false);
    };
    const handleViewPrediction = async (userId: number, userCode: string) => {
        try {
            const token = sessionStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/prediction`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (!response.ok) {
                if (result.error === 'PREDICTION_NOT_FOUND') {
                    alert(`El usuario ${userCode} no ha completado su quiniela.`);
                } else {
                    alert(`Error: ${result.error || result.message}`);
                }
                return;
            }

            // Mostrar la predicción en una ventana emergente/modal
            showPredictionModal(result.prediction);

        } catch (err: any) {
            alert('Error al cargar la predicción');
        }
    };
    const exportSimpleUsersList = () => {
        try {
            // Preparar datos para exportación
            const headers = ['Código', 'Nombre Completo', 'Tipo', 'Estado', 'Fecha Registro'];
            const rows = users.map(user => [
                user.user_code,
                user.full_name,
                user.is_admin ? 'Administrador' : 'Usuario',
                user.is_active ? 'Activo' : 'Inactivo',
                new Date(user.created_at).toLocaleDateString()
            ]);

                exportSimpleTableToPDF(
                    headers,
                    rows,
                    `Lista de Usuarios - ${new Date().toLocaleDateString()}`
                );
        } catch (error) {
            alert('Error al generar el PDF');
        }
    };
    return (
        <div className="space-y-6">
            <div className="mb-6">
                {/* Accesos directos - Siempre visibles */}
                <nav className="grid grid-cols-2 md:flex md:flex-row gap-2">
                    <Link
                        to="/admin"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">📊</span>
                        <span className="text-xs md:text-sm font-medium">Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-green-50 rounded-lg shadow border-2 border-green-300 hover:shadow-md transition-all"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">👥</span>
                        <span className="text-xs md:text-sm font-medium text-green-700">Usuarios</span>
                    </Link>

                    <Link
                        to="/admin/results"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">⚽</span>
                        <span className="text-xs md:text-sm font-medium">Resultados</span>
                    </Link>

                    <Link
                        to="/admin/ranking"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">🏆</span>
                        <span className="text-xs md:text-sm font-medium">Ranking</span>
                    </Link>
                </nav>
            </div>
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Nuevo Usuario
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            
            {/* Formulario de usuario */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código (3 letras)
                                </label>
                                <input
                                    type="text"
                                    value={formData.user_code}
                                    onChange={(e) => setFormData({ ...formData, user_code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    maxLength={3}
                                    required
                                    disabled={!!editingUser}
                                    placeholder="Ej: ABC"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                    placeholder="Nombre completo del usuario"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required={!editingUser}
                                    placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <input
                                    type="hidden"
                                    value="false"
                                    placeholder=" "
                                />

                                <label className="flex items-center">
                                    
                                    <span className="text-sm font-medium text-gray-700">Activo</span>
                                </label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="mr-2"
                                    placeholder="Check"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                {editingUser ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table key={tableKey} className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="hidden lg:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Creación
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quiniela
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Enviada?
                                </th>
                            </tr>
                        </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                users
                                    .slice()
                                    .sort((a, b) => a.user_code.localeCompare(b.user_code))
                                    .map((user) => (                                       
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono font-bold">{user.user_code}</span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                </td>
                                                <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {user.is_admin ? 'Administrador' : 'Usuario'}
                                                    </span>
                                                </td>
                                                <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="hidden lg:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" disabled={user.user_code === 'ADM'}>
                                                        Eliminar
                                                    </button>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                    <button onClick={() => handleViewPrediction(user.id, user.user_code)} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 border border-green-300 text-sm">
                                                        👁️ Ver
                                                    </button>
                                                </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                                                
                                                {loadingPredictions ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8">
                                                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    </span>
                                                ) : predictionsStatus[user.id] ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full border-2 border-green-300" title="Tiene predicción">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full border-2 border-red-300" title="Sin predicción">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            )}
            
                    </tbody>
                </table>
            </div>
            </div>
            {/* Sección de Lista Simple Vertical -*/}
            <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">
                            📋 Impresión de Usuarios y Nombres
                        </h3>
                        <div className="space-x-3">
                            <button
                                onClick={() => setShowSimpleList(!showSimpleList)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                {showSimpleList ? 'Ocultar Lista' : 'Mostrar Lista'}
                            </button>
                            <button
                                onClick={exportSimpleUsersList}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                disabled={users.length === 0 }
                            >
                                📄 Exportar PDF
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Lista simple de todos los usuarios registrados ({users.length} usuarios)
                    </p>
                </div>

                {showSimpleList && (
                    <div className="p-6">
                        {/* Estadísticas rápidas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-600 font-medium">Total Usuarios</div>
                                <div className="text-2xl font-bold">{users.length}</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="text-sm text-green-600 font-medium">Usuarios Activos</div>
                                <div className="text-2xl font-bold">
                                    {users.filter(u => u.is_active).length}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="text-sm text-gray-600 font-medium">Registro más reciente</div>
                                <div className="text-lg font-medium">
                                    {users.length > 0 ?
                                        new Date(Math.max(...users.map(u => new Date(u.created_at).getTime())))
                                            .toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Lista vertical simple */}
                        <div key={tableKey} className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {[...users]
                                .sort((a, b) => a.user_code.localeCompare(b.user_code)) // Ordena de la A a la Z
                                .map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
                                    >
                                        <div  className="flex items-center space-x-2">
                                            <div className="text-gray-500 font-medium w-6 text-center text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="w-14">
                                                <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-sm">
                                                    {user.user_code}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 text-sm">{user.full_name}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 ml-2">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                        </div>


                        {/* Resumen al final */}
                        {users.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Mostrando {users.length} usuarios •
                                    Última actualización: {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;