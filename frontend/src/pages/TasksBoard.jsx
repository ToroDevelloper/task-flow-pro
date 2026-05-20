import { useMemo, useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { statusColumns, formatFullDate } from '../utils/formatters';
import { useTaskSocket } from '../hooks/useTaskSocket';

// Lee el JWT del almacenamiento — ajusta la clave si tu app usa otra
function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    null
  );
}

function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]))?.sub ?? null;
  } catch {
    return null;
  }
}

export default function TasksBoard() {
  const { session, role, tasks, onMoveTask, onDeleteTask, projectId } = useOutletContext();
  const [draggedTask, setDraggedTask] = useState(null);

  const [localTasks, setLocalTasks] = useState(tasks ?? []);

  useEffect(() => {
    setLocalTasks(tasks ?? []);
  }, [tasks]);

  // ── WebSocket 
  const token  = getToken();
  const userId = session?.user?.id ?? getUserIdFromToken(token);

  const handleRemoteTaskMoved = useCallback(({ taskId, newStatus }) => {
    setLocalTasks((prev) =>
      prev.map((t) => (String(t.id) === String(taskId) ? { ...t, estado: newStatus } : t))
    );
  }, []);

  const handleMoveError = useCallback(({ taskId, previousStatus, message }) => {
    console.warn(`[Kanban] Rollback tarea ${taskId} → ${previousStatus}:`, message);
    setLocalTasks((prev) =>
      prev.map((t) => (String(t.id) === String(taskId) ? { ...t, estado: previousStatus } : t))
    );
  }, []);

  const { emitTaskMoved } = useTaskSocket({
    projectId,
    token,
    userId,
    onTaskMoved: handleRemoteTaskMoved,
    onMoveError: handleMoveError,
  });

  // ── Lógica existente (sin cambios)
  const canDeleteTask = role === 'ADMIN';

  const groupedTasks = useMemo(() => {
    const source =
      role === 'DESARROLLADOR'
        ? localTasks.filter((task) => task.idUsuarioAsignado === session?.user?.id)
        : localTasks;
    return statusColumns.reduce((acc, column) => {
      acc[column.id] = source.filter((task) => task.estado === column.id);
      return acc;
    }, {});
  }, [role, session?.user?.id, localTasks]);

  const canMoveTask = (task) =>
    role !== 'DESARROLLADOR' || task.idUsuarioAsignado === session?.user?.id;

  const dropTask = (newStatus) => {
    if (!draggedTask) return;

    const previousStatus = draggedTask.estado;
    if (previousStatus === newStatus) {
      setDraggedTask(null);
      return;
    }

    // 1. Optimistic update local inmediato
    setLocalTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(draggedTask.id) ? { ...t, estado: newStatus } : t
      )
    );


    emitTaskMoved(draggedTask.id, newStatus, previousStatus);

    setDraggedTask(null);
  };

  return (
    <section className="page board-page">
      <div className="page-heading page-heading--board">
        <div>
          <h1>Tablero de tareas</h1>
          <p>
            {role === 'DESARROLLADOR'
              ? 'Solo tus tareas asignadas'
              : 'Todas las tareas del sistema'}
          </p>
        </div>
      </div>

      <div className="kanban-board">
        {statusColumns.map((column) => (
          <section
            className="kanban-column"
            key={column.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropTask(column.id)}
          >
            <header>
              <strong>{column.label}</strong>
              <span>{groupedTasks[column.id]?.length || 0}</span>
            </header>
            <div className="kanban-column__body">
              {(groupedTasks[column.id] || []).map((task) => (
                <article
                  className="task-card"
                  key={task.id}
                  draggable={canMoveTask(task)}
                  onDragStart={() => setDraggedTask(task)}
                >
                  <div className="task-card__top">
                    <span className="priority">{task.estado}</span>
                    <MoreHorizontal size={18} />
                  </div>
                  <h3>{task.titulo}</h3>
                  {task.fechaFin && (
                    <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>
                      Vence: {formatFullDate(task.fechaFin)}
                    </p>
                  )}
                  <footer>
                    <span>{task.usuarioAsignado?.nombre || 'Sin asignar'}</span>
                    {canDeleteTask ? (
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label="Eliminar tarea"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </footer>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}