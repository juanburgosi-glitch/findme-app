// service-worker.js

self.addEventListener('install', event => {
    console.log('Service Worker instalado.');
});

self.addEventListener('activate', event => {
    console.log('Service Worker activado.');
});

// Esta función se ejecutará cuando la app principal le envíe un mensaje
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'START_TRACKING') {
        const { personId, token } = event.data.payload;
        console.log(`Iniciando seguimiento para personId: ${personId}`);

        // Inicia el seguimiento de geolocalización en segundo plano
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('Ubicación obtenida en segundo plano:', latitude, longitude);

                // Envía la ubicación al servidor
                fetch('/api/location/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        lat: latitude,
                        lon: longitude,
                        personId: personId
                    })
                }).then(response => {
                    if(response.ok) console.log("Ubicación enviada al servidor.");
                }).catch(error => {
                    console.error("Error al enviar ubicación:", error);
                });
            },
            (error) => {
                console.error('Error de geolocalización en segundo plano:', error);
            },
            {
                enableHighAccuracy: true
            }
        );
    }
});