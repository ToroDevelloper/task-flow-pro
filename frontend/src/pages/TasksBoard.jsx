import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { statusColumns, formatFullDate } from '../utils/formatters';

export default function TasksBoard() {
  const { session, role, tasks, onMoveTask, onDeleteTask } = useOutletContext();
  const [draggedTask, setDraggedTask] = useState(null);
  const canDeleteTask = role === 'ADMIN';

  const groupedTasks = useMemo(() => {
    const source = role === 'DESARROLLADOR'
      ? tasks.filter((task) => task.idUsuarioAsignado === session?.user?.id)
      : tasks;
    return statusColumns.reduce((acc, column) => {
      acc[column.id] = source.filter((task) => task.estado === column.id);
      return acc;
    }, {});
  }, [role, session?.user?.id, tasks]);

  const canMoveTask = (task) => role !== 'DESARROLLADOR' || task.idUsuarioAsignado === session?.user?.id;

  const dropTask = (status) => {
    if (!draggedTask) return;
    onMoveTask(draggedTask.id, status);
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
                  {task.fechaFin && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>Vence: {formatFullDate(task.fechaFin)}</p>}
                  <footer>
                    <span>{task.usuarioAsignado?.nombre || 'Sin asignar'}</span>
                    {canDeleteTask ? (
                      <button className="icon-button" type="button" onClick={() => onDeleteTask(task.id)} aria-label="Eliminar tarea">
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
