# Diagrama unifilar dinamico

Entregables generados desde la imagen proporcionada:

- `diagrama_unifilar_detallado.pdf`: PDF vectorial con diagrama, tabla y notas.
- `index.html`: app web estatica para editar valores en tiempo real.
- `app.js` y `styles.css`: logica y estilo de la app.
- `unifilar_data.json`: datos base transcritos.

## Alcance

No contiene calculos electricos nuevos. Los valores se limitan a lo visible en la imagen original. Para revision completa se requieren tension, fases, longitudes, cargas, canalizacion, material, aislamiento, temperatura, agrupamiento, capacidad interruptiva y datos del tablero/acometida.

## Campos agregados

La app incluye campos editables para tension del sistema, numero de fases y puesta a tierra, carga por circuito, longitudes, tipo de conductor y aislamiento, tipo/diametro de canalizacion, capacidad interruptiva y curva/tipo de interruptores, tablero, barras, gabinete y datos de acometida.

Estos campos quedan vacios por defecto y se muestran como "Por definir" hasta capturar informacion real del proyecto.
