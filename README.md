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

La version actual abre con un ejemplo didactico completo ya precargado para poder generar de inmediato un diagrama unifilar, su UnifilarScript y los PDF simplificado/completo. Los valores son muestra de captura y deben verificarse en campo antes de usarse como documento tecnico.

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

## Version React

La interfaz fue migrada a React y organiza la captura en secciones: proyecto, acometida, sistema electrico, tablero, puesta a tierra, seguridad STPS, circuitos, cuadro de cargas y UnifilarScript.

El formulario genera automaticamente `UnifilarScript v2`, un lenguaje textual propio para reconstruir diagramas unifilares a partir del levantamiento en campo. La app no ejecuta calculos normativos automaticos; conserva campos de captura y leyendas de verificacion para evitar datos inventados.

Campos considerados para revision/captura: tension, fases, hilos, frecuencia, sistema de puesta a tierra, acometida, medicion, interruptor principal, capacidad interruptiva, alimentador, tipo de conductor, aislamiento, canalizacion, tablero, barras, gabinete, circuitos derivados, protecciones, conductores de fase/neutro/tierra, longitudes, cargas, cuadro de cargas, EPP, bloqueo/etiquetado, rotulado y notas de riesgo.

## Cuadro de cargas editable

El apartado `Cuadro de cargas` ahora permite capturar por separado fase, tipo de carga, VA instalado, VA demandado, corriente, factor de potencia y observaciones por circuito. Esos valores actualizan el estado global de la app y se integran automaticamente al `UnifilarScript` generado.

## Ejemplo completo precargado

El proyecto de muestra se llama `Oficina y almacen - ejemplo didactico` e incluye datos de proyecto, acometida, sistema, tablero, puesta a tierra, seguridad STPS, ocho circuitos derivados y cuadro de cargas por circuito. Se usa como punto de partida editable para demostrar el flujo completo: llenar campos, reconstruir el plano con UnifilarScript, imprimir y descargar PDF.
