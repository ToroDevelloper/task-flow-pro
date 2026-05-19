import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

/**
 * @param {object}        opts
 * @param {string|number} opts.projectId   – ID del proyecto (Room)
 * @param {string}        opts.token       – JWT del usuario autenticado
 * @param {string}        opts.userId      – sub del JWT (requerido por MoveTaskDto)
 * @param {Function}      opts.onTaskMoved – Callback cuando otro usuario mueve una tarea
 *                                           Recibe: { taskId, newStatus, previousStatus, userId }
 * @param {Function}      opts.onMoveError – Callback cuando el servidor rechaza el movimiento
 *                                           
 */
export function useTaskSocket({ projectId, token, userId, onTaskMoved, onMoveError }) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!projectId || !token) return;

    const socket = io(`${WS_URL}/kanban`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_project', { projectId, token });
    });

   
    socket.on('task_updated', (payload) => {
      // payload: { taskId, newStatus, previousStatus, userId }
      onTaskMoved?.(payload);
    });

    socket.on('task_move_error', (payload) => {
      // payload: { taskId, previousStatus, message }
      onMoveError?.(payload);
    });

    socket.on('connect_error', (err) => {
      console.warn('[WS] Error de conexión:', err.message);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leave_project', { projectId });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, token]); // eslint-disable-line react-hooks/exhaustive-deps


  const emitTaskMoved = useCallback(
    (taskId, newStatus, previousStatus) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        console.warn('[WS] Socket desconectado. El movimiento no se sincronizará en tiempo real.');
        return;
      }
      socket.emit('task_moved', {
        taskId,
        newStatus,
        previousStatus,
        userId,   
        projectId,
      });
    },
    [projectId, userId],
  );

  return { emitTaskMoved };
}