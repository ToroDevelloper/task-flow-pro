import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { formatFullDate } from '../utils/formatters';

export default function Calendar() {
  const { tasks } = useOutletContext();
  const orderedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => new Date(a.fechaCreacion || 0).getTime() - new Date(b.fechaCreacion || 0).getTime(),
      ),
    [tasks],
  );

  return (
    <section className="page calendar-page">
      <div className="page-heading">
        <h1>Calendario de tareas</h1>
        <p>Ordenado por fecha de creacion registrada en la API.</p>
      </div>

      <div className="upcoming-card">
        <h2>Actividad</h2>
        {orderedTasks.map((task) => (
          <article key={task.id}>
            <Clock3 size={20} />
            <div>
              <strong>{task.titulo}</strong>
              <span>{formatFullDate(task.fechaCreacion)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
