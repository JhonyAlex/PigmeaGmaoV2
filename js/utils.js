 // js/utils.js
const Utils = (() => {
    // Generador simple de UUIDs (suficiente para este caso)
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Formatear fecha (puedes personalizar el formato)
    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleString('es-ES'); // Formato local español
        } catch (e) {
            console.error("Error formatting date:", isoString, e);
            return isoString; // Devolver original si falla
        }
    };

    // Escapar HTML para prevenir XSS simple al mostrar datos
    const escapeHTML = (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    };


    return {
        generateUUID,
        formatDate,
        escapeHTML
    };
})();