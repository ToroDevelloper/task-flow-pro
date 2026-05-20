import { create } from 'zustand';
import { io } from 'socket.io-client';
import { getStoredSession } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

export const useSocketStore = create((set, get) => {
  let socket = null;

  return {
    socket: null,
    isConnected: false,
    messages: {},
    currentProject: null,
    loading: false,
    error: null,

    // Inicializar conexión del socket
    initializeSocket: () => {
      const session = getStoredSession();
      const token = session?.accessToken || session?.token;
      if (!session || !token) {
        set({ error: 'No hay sesión activa' });
        return;
      }

      if (socket) {
        socket.disconnect();
      }

      socket = io(`${API_BASE_URL}/chat`, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        set({ isConnected: true, error: null });
        console.log('✅ Socket conectado al namespace /chat');
      });

      socket.on('connect_error', (error) => {
        set({ error: `Error de conexión: ${error.message}` });
        console.error('❌ Error de conexión Socket.io:', error);
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
        console.log('❌ Socket desconectado');
      });

      socket.on('joinedProject', (payload) => {
        const { projectId, messages: joinedMessages } = payload || {};
        if (projectId && Array.isArray(joinedMessages)) {
          set((state) => ({
            messages: {
              ...state.messages,
              [projectId]: joinedMessages,
            },
          }));
        }
        console.log('👥 Joined project:', projectId, joinedMessages?.length);
      });

      socket.on('newMessage', (message) => {
        const msgProjectId = message.projectId || message.idProyecto;
        if (!msgProjectId) return;
        set((state) => ({
          messages: {
            ...state.messages,
            [msgProjectId]: [
              ...(state.messages[msgProjectId] || []),
              message,
            ],
          },
        }));
        console.log('📨 Nuevo mensaje recibido:', message);
      });

      socket.on('error', (error) => {
        const message =
          typeof error === 'string'
            ? error
            : error?.error?.message || error?.message || JSON.stringify(error);
        set({ error: message });
        console.error('❌ Error del socket:', error);
      });

      set({ socket, isConnected: false });
    },

    // Unirse a una sala (proyecto)
    joinProject: (projectId) => {
      const state = get();
      if (!state.socket || !state.isConnected) {
        console.warn('Socket no está conectado');
        return;
      }

      state.socket.emit('joinProject', { projectId });
      set({ currentProject: projectId });
      console.log(`👥 Unido al proyecto: ${projectId}`);
    },

    // Salir de una sala (proyecto)
    leaveProject: (projectId) => {
      const state = get();
      if (!state.socket || !state.isConnected) {
        console.warn('Socket no está conectado');
        return;
      }

      state.socket.emit('leaveProject', { projectId });
      set({ currentProject: null });
      console.log(`👋 Saliendo del proyecto: ${projectId}`);
    },

    // Enviar mensaje
    sendMessage: (projectId, content) => {
      const state = get();
      if (!state.socket || !state.isConnected) {
        set({ error: 'Socket no está conectado' });
        console.warn('Socket no está conectado');
        return;
      }

      if (!content.trim()) {
        set({ error: 'El mensaje no puede estar vacío' });
        return;
      }

      state.socket.emit('sendMessage', {
        projectId,
        content,
      });

      console.log('📤 Mensaje enviado:', content);
    },

    // Cargar mensajes iniciales (desde HTTP)
    setMessages: (projectId, messages) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [projectId]: messages,
        },
      }));
    },

    // Limpiar mensajes de un proyecto
    clearProjectMessages: (projectId) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [projectId]: [],
        },
      }));
    },

    // Desconectar socket
    disconnectSocket: () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      set({ socket: null, isConnected: false, messages: {}, currentProject: null });
    },

    // Establecer error
    setError: (error) => {
      set({ error });
    },

    // Limpiar error
    clearError: () => {
      set({ error: null });
    },
  };
});
