const API_URL = '/api';

const reservationSystem = {
    // Check availability is now handled by server on POST, but we can pre-check or just try-submit.
    // We will just try-submit for simplicity as the server handles concurrency.

    async addBooking(bookingData) {
        try {
            const response = await fetch(`${API_URL}/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                return { success: true, message: '¡Reserva confirmada!', booking: result.booking };
            } else {
                return { success: false, message: result.message || 'Error al reservar.' };
            }
        } catch (error) {
            console.error('Error de red:', error);
            return { success: false, message: 'No se pudo conectar con el servidor.' };
        }
    },

    // Admin only - but left here for legacy compatibility if needed
    async deleteBooking(id) {
        // Not used by client
    },
    getAllBookings() {
        // Not used by client (server side only now)
        return [];
    }
};
