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

## UnifilarScript

La app incluye un lenguaje propio para reconstruir el plano desde texto, similar en espiritu a Mermaid pero enfocado en diagramas unifilares. Ejemplo:

```text
titulo "DIAGRAMA UNIFILAR"
acometida "Acometida CFE"
principal "2x70"
alimentador "2 cal.8, 1 cal. 8 N, 1 cal. 12 T"
sistema tension="220/127 V" fases_tierra="1F+N+T"
acometida_datos longitud="Por definir" conductor="Por definir" canalizacion="Por definir" aic_curva="Por definir" tablero="Por definir"

circuito "Contacto Administracion" interruptor="1x30" conductor="2 cal.10, 1 cal. 10 N, 1 cal. 12 T" fase="A" va_instalado="" va_demandado="" corriente="" fp="" notas=""
circuito "Aire / acondicionado" interruptor="2x50" conductor="2 cal.8, 1 cal. 8 N, 1 cal. 12 T" fase="AB" tipo="Aire acondicionado"
```

Comandos soportados: `titulo`, `acometida`, `principal`, `alimentador`, `sistema`, `acometida_datos` y `circuito`. Cada linea `circuito` reconstruye una derivacion; por lo tanto, el numero de circuitos del plano cambia segun el codigo capturado tras el estudio en campo.
