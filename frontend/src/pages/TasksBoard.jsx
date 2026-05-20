import { useMemo, useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { statusColumns, formatFullDate } from '../utils/formatters';
import { useTaskSocket } from '../hooks/useTaskSocket';

export default function TasksBoard() {

  const { session, role, tasks, onMoveTask, onDeleteTask, selectedProjectId } = useOutletContext();
  const [draggedTask, setDraggedTask] = useState(null);
  const token  = session?.accessToken ?? null;
  const userId = session?.user?.id    ?? null;
  const projectTasks = useMemo(
    () => (selectedProjectId ? tasks.filter((t) => t.idProyecto === selectedProjectId) : tasks),
    [tasks, selectedProjectId],
  );

  // Copia local para aplicar cambios en tiempo real sin esperar al padre
  const [localTasks, setLocalTasks] = useState(projectTasks);

  // Sincronizar cuando el padre recarga o cambia de proyecto
  useEffect(() => {
    setLocalTasks(projectTasks);
  }, [projectTasks]);

  // ── WebSocket ──────────────────────────────────────────────────────────────

  const handleRemoteTaskMoved = useCallback(({ taskId, newStatus }) => {
    setLocalTasks((prev) =>
      prev.map((t) => String(t.id) === String(taskId) ? { ...t, estado: newStatus } : t)
    );
  }, []);

  const handleMoveError = useCallback(({ taskId, previousStatus, message }) => {
    console.warn(`[Kanban] Rollback tarea ${taskId} → ${previousStatus}:`, message);
    setLocalTasks((prev) =>
      prev.map((t) => String(t.id) === String(taskId) ? { ...t, estado: previousStatus } : t)
    );
  }, []);

  const { emitTaskMoved, isConnected } = useTaskSocket({
    projectId: selectedProjectId,
    token,
    userId,
    onTaskMoved: handleRemoteTaskMoved,
    onMoveError: handleMoveError,
  });

  const canDeleteTask = role === 'ADMIN';

  const groupedTasks = useMemo(() => {
  return statusColumns.reduce((acc, column) => {
    acc[column.id] = localTasks.filter((task) => task.estado === column.id);
    return acc;
    }, {});
  }, [localTasks]);

  const canMoveTask = (task) =>
    role !== 'DESARROLLADOR' || task.idUsuarioAsignado === session?.user?.id;

  const dropTask = (newStatus) => {
    if (!draggedTask) return;

    const previousStatus = draggedTask.estado;
    if (previousStatus === newStatus) {
      setDraggedTask(null);
      return;
    }

    setLocalTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(draggedTask.id) ? { ...t, estado: newStatus } : t
      )
    );

    const enviado = emitTaskMoved(draggedTask.id, newStatus, previousStatus);

    if (!enviado) {
      onMoveTask(draggedTask.id, newStatus);
    }

    setDraggedTask(null);
  };

  return (
    <section className="page board-page">
      <div className="page-heading page-heading--board">
        <div>
          <h1>Tablero de tareas</h1>
          <p>{role === 'DESARROLLADOR' ? 'Solo tus tareas asignadas' : 'Todas las tareas del sistema'}</p>
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