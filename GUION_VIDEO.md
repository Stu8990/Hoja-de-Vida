# Guión para Video de Presentación
## "Cartero del Vecindario" - Vertical Slice

**Duración total:** 3-5 minutos

---

## INTRO (15 segundos)

> "Hola, mi nombre es [TU NOMBRE] y este es mi Vertical Slice para el examen final de Software para Videojuegos. El proyecto se llama **Cartero del Vecindario**, un juego 3D en primera persona desarrollado con Babylon.js donde el jugador debe recoger y entregar cartas en un vecindario suburbano."

---

## PARTE 1: DEMOSTRACIÓN DE GAMEPLAY (1 minuto)

*[Mostrar el juego corriendo en el navegador]*

> "Vamos a ver el juego en acción."

*[Click en "Jugar"]*

> "Al iniciar, el jugador aparece en el vecindario. En la parte superior pueden ver el **HUD minimalista** que diseñé con tres elementos clave:"

*[Señalar cada elemento]*

> "A la izquierda, el **estado actual** que indica qué debe hacer el jugador. En el centro, una **brújula direccional** que apunta hacia la casa destino. Y a la derecha, el **contador de entregas**."

*[Caminar hacia la oficina postal]*

> "El objetivo es simple: primero debo recoger la carta en la oficina postal, que está marcada con una zona azul brillante."

*[Acercarse a la carta - mostrar el crosshair cambiando]*

> "Noten cómo el **crosshair cambia de color** cuando estoy cerca de un objeto interactivo. Esto da feedback visual inmediato al jugador."

*[Presionar E para recoger]*

> "Al presionar E, se reproduce un **sonido de pickup** y aparecen **partículas naranjas**. La carta ahora está en mi inventario."

*[Seguir la brújula hacia la casa]*

> "Ahora la brújula me indica la dirección hacia la casa destino. Cada casa tiene un **número 3D flotante** para facilitar la identificación."

*[Entregar la carta]*

> "Al entregar, se dispara una **celebración visual**: confetti, destello de pantalla, y un sonido de éxito tipo fanfare. El contador incrementa y se selecciona una nueva casa aleatoria."

---

## PARTE 2: EXPLICACIÓN TÉCNICA (1.5 minutos)

*[Abrir VS Code o el editor con el código]*

> "Ahora quiero mostrarles un desafío técnico que resolví: el **Sistema de Audio usando el patrón Singleton**."

*[Abrir audio.js]*

> "En el archivo `audio.js`, implementé una clase `AudioManager` que sigue el patrón Singleton. Esto significa que solo puede existir **una única instancia** en todo el juego."

*[Señalar el código]*

```javascript
class AudioManager {
    static instance = null;

    constructor() {
        if (AudioManager.instance) return AudioManager.instance;
        this.ctx = new AudioContext();
        AudioManager.instance = this;
    }
}
```

> "¿Por qué usar Singleton? Porque el audio debe ser **centralizado**. No queremos múltiples instancias reproduciendo sonidos simultáneamente de forma descontrolada."

*[Mostrar el método playPickup o playDelivery]*

> "Lo interesante es que uso **Web Audio API** para generar sonidos **sintéticos**, sin necesidad de archivos de audio externos. Por ejemplo, el sonido de pickup es un tono ascendente generado con osciladores:"

```javascript
playPickup() {
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(523, now);      // Nota C5
    osc.frequency.exponentialRampToValueAtTime(1047, now + 0.15);  // Sube a C6
}
```

> "Esto hace que el juego sea más **portable** y **ligero**, sin dependencias de archivos externos."

*[Mostrar brevemente interactions.js]*

> "Otro sistema interesante es la **brújula direccional**. Calculo el ángulo entre la dirección de la cámara y la posición de la casa destino, y roto la flecha CSS en consecuencia."

---

## PARTE 3: CONEXIÓN CON EL DISEÑO (45 segundos)

> "Ahora, ¿cómo se conecta esto con el diseño del juego?"

> "Mi Vertical Slice tiene un **enfoque en mecánicas**. La mecánica central es el ciclo de **recoger y entregar**, que es simple pero satisfactorio."

> "Durante la implementación, tuve que hacer algunos **ajustes** respecto a la idea original:"

> "Primero, agregué la **brújula direccional** porque en pruebas tempranas los jugadores se perdían buscando las casas. La brújula **elimina la frustración** sin eliminar la exploración."

> "Segundo, agregué **números 3D** sobre las casas. Esto fue una decisión de **accesibilidad** para que los jugadores identifiquen rápidamente su destino."

> "Tercero, el **feedback audiovisual** fue más importante de lo que anticipé. Las partículas y sonidos transforman una tarea simple en algo **gratificante**."

---

## PARTE 4: JUSTIFICACIÓN MDA (45 segundos)

> "Finalmente, quiero explicar el juego usando el marco **MDA: Mecánicas, Dinámicas y Estéticas**."

> "**Las mecánicas** son las acciones que el jugador realiza: moverse con WASD, mirar con el mouse, e interactuar con E para recoger y entregar."

> "**Las dinámicas** son los comportamientos que emergen: el jugador explora el vecindario, optimiza mentalmente sus rutas entre la oficina y las casas, y experimenta un ciclo de pickup, navegación y entrega."

> "**Las estéticas** son las emociones que el juego genera:"
- "**Satisfacción**: El feedback visual y sonoro al completar entregas genera una respuesta positiva inmediata."
- "**Logro**: Ver el contador subir motiva a continuar jugando."
- "**Orientación**: La brújula y los números eliminan la frustración, permitiendo enfocarse en la diversión."

> "En resumen: una mecánica simple de recoger y entregar, combinada con feedback audiovisual bien diseñado, crea una experiencia **gratificante y adictiva**."

---

## CIERRE (15 segundos)

> "Este fue mi Vertical Slice 'Cartero del Vecindario'. El código está disponible en el repositorio de GitHub con un README completo que incluye instrucciones de ejecución y documentación técnica."

> "Gracias por su atención."

---

## NOTAS PARA LA GRABACIÓN

### Consejos técnicos:
- Graba a **1080p** mínimo
- Usa **OBS Studio** o similar
- Captura tanto el juego como el editor de código
- Habla claro y a ritmo pausado

### Tiempos aproximados:
| Sección | Duración |
|---------|----------|
| Intro | 15 seg |
| Gameplay | 60 seg |
| Código | 90 seg |
| Diseño | 45 seg |
| MDA | 45 seg |
| Cierre | 15 seg |
| **Total** | **4:30 min** |

### Puntos clave a NO olvidar:
1. ✅ Mostrar el gameplay funcionando
2. ✅ Mostrar código del AudioManager (Singleton)
3. ✅ Mencionar qué cambios hiciste vs el diseño original
4. ✅ Explicar MDA con ejemplos concretos del juego

### Archivos a tener abiertos:
- `Examen/js/audio.js` (para mostrar Singleton)
- `Examen/js/interactions.js` (para mostrar brújula)
- El juego corriendo en el navegador

---

¡Buena suerte con la grabación! 🎬
