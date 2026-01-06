# n8n-nodes-whatsapp-message

Un nodo personalizado para n8n que permite enviar mensajes por WhatsApp utilizando la API de WhatsApp Business con soporte completo para mensajes interactivos, detección de cierre de conversación y mensajes de espera automáticos.

## Características

- **Mensajes de texto** simples o con imágenes
- **Listas interactivas** (hasta 10 opciones con descripciones)
- **Botones interactivos** (hasta 3 botones de respuesta)
- **Botones Call-to-Action (CTA)** con URLs externas
- **Soporte para imágenes** en todos los tipos de mensaje
- **Headers personalizables** (texto o imagen con URL)
- **Footers opcionales** para contexto adicional
- **Detección automática de cierre** de conversación
- **Dos outputs** (Continue/Close) para flujos condicionales
- **Mensajes de espera automáticos** mientras se procesan tareas largas
- **Procesamiento de webhooks** para respuestas de usuarios
- Soporte para números internacionales
- Reintentos automáticos configurables
- Integración completa con n8n

## Instalación

```bash
npm install n8n-nodes-whatsapp-message
```

O en n8n, ve a **Settings > Community Nodes** y busca `n8n-nodes-whatsapp-message`.

## Configuración

### Requisitos previos

1. Una cuenta de **WhatsApp Business API**
2. Tu **Phone Number ID**
3. Un **Access Token** válido de Meta/Facebook
4. Tu número de WhatsApp debe estar verificado y activo

### Pasos de configuración

1. En n8n, abre tu workflow
2. Agrega el nodo **WhatsApp Message**
3. Haz clic en **Credentials** y selecciona **Create New Credentials**
4. Completa los campos:
   - **Phone Number ID**: El ID del número de teléfono de WhatsApp Business
   - **Access Token**: Tu token de acceso (obtenido de Meta/Facebook)
   - **API Version**: Selecciona la versión (por defecto v22.0)

## Tipos de mensajes

### 1. Mensaje de texto

Envía mensajes de texto simples o con imágenes adjuntas.

**Parámetros:**
- **Message**: El texto del mensaje
- **Include Image**: Opción para agregar una imagen
- **Image URL**: URL de la imagen (formato: https://...)
- **Caption**: Texto que acompaña la imagen

**Ejemplo:**
```
Message Type: Text
Message: "¡Hola! Tenemos una promoción especial para ti"
Include Image: ✓
Image URL: https://mipanederia.com/promo.jpg
Caption: "20% de descuento en pan integral"
```

### 2. Lista interactiva

Crea menús con hasta 10 opciones que incluyen título, ID y descripción opcional.
**Nota importante sobre imágenes en listas:**
Debido a una limitación de la API de WhatsApp, cuando usas "Header Type: Image" en listas, la imagen se envía como un mensaje separado (0.3 segundos antes de la lista). Esto es automático y transparente - el usuario verá la imagen seguida inmediatamente de la lista. Este comportamiento solo ocurre en listas; los botones y CTA envían imágenes directamente en el header sin problema.

**Parámetros:**
- **Body Text**: Texto principal del mensaje
- **Button Text**: Texto del botón que abre la lista
- **Header Type**: None, Text o Image
- **Footer**: Texto opcional al final
- **Options**: Una opción por línea en formato: `Título|id|descripción|close`

**Formato de opciones:**
```
Pizza Margarita|pizza_mg|Queso mozzarella y albahaca
Pasta Carbonara|pasta_cb|Receta italiana tradicional
Ensalada César|ensalada_cs|Lechuga fresca con aderezo
Salir|exit_id|Cerrar el pedido|true
```

**Ejemplo completo:**
```
Message Type: Interactive List
Body Text: "¿Qué te gustaría ordenar hoy?"
Button Text: "Ver menú completo"
Header Type: Image
Header Image URL: https://restaurante.com/logo.jpg
Footer: "Delivery gratis en órdenes mayores a $50"
Options:
  Desayuno completo|desayuno|Huevos, pan y café
  Almuerzo ejecutivo|almuerzo|Sopa, plato fuerte y jugo
  Cena especial|cena|Proteína, acompañamiento
  No tengo hambre|salir|Cerrar conversación|true
```

### 3. Botones interactivos

Crea hasta 3 botones de respuesta rápida.

**Parámetros:**
- **Body Text**: Texto principal del mensaje
- **Header Type**: None, Text o Image
- **Footer**: Texto opcional al final
- **Buttons**: Un botón por línea en formato: `Texto del botón|button_id|close`

**Formato de botones:**
```
Sí, me interesa|yes_btn
No gracias|no_btn|true
Más información|info_btn
```

**Ejemplo completo:**
```
Message Type: Interactive Buttons
Body Text: "¿Te gustaría recibir nuestro catálogo de productos por email?"
Header Type: Text
Header Text: "Catálogo Digital 2025"
Footer: "Sin costo ni compromiso"
Buttons:
  Sí, envíalo|send_catalog
  No gracias|no_catalog|true
  Ver muestra|preview_catalog
```

### 4. Call to Action (CTA)

Crea botones que redirigen a URLs externas (solo 1 botón por mensaje).

**Parámetros:**
- **Body Text**: Texto principal del mensaje
- **Header Type**: None, Text o Image
- **Footer**: Texto opcional al final
- **Action Buttons**: Formato: `Texto del botón|url|https://ejemplo.com`

**Ejemplo:**
```
Message Type: Call to Action
Body Text: "Visita nuestra tienda online para ver todos nuestros productos"
Header Type: Image
Header Image URL: https://tienda.com/banner.jpg
Footer: "Envío gratis en tu primera compra"
Action Buttons: Ir a la tienda|url|https://tienda.com/productos
```

## Sistema de outputs (Continue/Close)

El nodo tiene **dos salidas** para crear flujos conversacionales inteligentes:

### Output 1: Continue
Se activa cuando:
- El usuario selecciona una opción normal (sin marcar como `close`)
- Se envía un mensaje exitosamente
- El flujo debe continuar

### Output 2: Close
Se activa cuando:
- El usuario selecciona una opción marcada como cierre (`|true` al final)
- El ID de la opción está en la lista de **Close Option IDs**
- Se debe terminar la conversación

### Configuración de detección de cierre

**Parámetros:**
- **Enable Close Detection**: Activa la detección automática
- **Close Option IDs**: IDs separados por comas (ej: `exit_id,salir_id,no_thanks`)
- **Goodbye Message**: Mensaje automático que se envía al cerrar

**Ejemplo de configuración:**
```
Enable Close Detection: ✓ Activado
Close Option IDs: salir,exit,no_gracias,cerrar
Goodbye Message: "Gracias por contactarnos. ¡Hasta pronto!"
```

### Ejemplo de workflow con outputs

```
[Webhook Trigger] 
    ↓
[WhatsApp Message - Lista interactiva]
    ↓
    ├─→ Continue Output → [Procesar pedido] → [Confirmar orden]
    └─→ Close Output → [Registro de abandono] → [Fin]
```

## Mensajes de espera automáticos

Mantén a tus usuarios informados durante procesos largos con mensajes automáticos.

**Parámetros:**
- **Send Waiting Messages**: Activa los mensajes automáticos
- **Wait Time Before First Check**: Segundos antes del primer mensaje (5-600)
- **Interval Between Messages**: Intervalo entre mensajes (10-300 segundos)
- **Waiting Messages**: Mensajes que se alternarán (uno por línea)
- **Max Messages**: Cantidad máxima de mensajes automáticos (1-20)

**Ejemplo:**
```
Send Waiting Messages: ✓ Activado
Wait Time Before First Check: 30
Interval Between Messages: 45
Waiting Messages:
  ¿Sigues ahí? Aún estoy procesando tu solicitud
  Todavía trabajando en ello... gracias por esperar
  Casi listo, un momento más por favor
Max Messages: 5
```

**Caso de uso típico:**
1. Usuario solicita un reporte complejo
2. Envías mensaje: "Generando tu reporte, esto puede tomar unos minutos..."
3. El sistema envía mensajes de espera mientras procesa
4. Finalmente envías: "¡Listo! Aquí está tu reporte"

## Procesamiento de webhooks

El nodo puede procesar webhooks de WhatsApp para capturar respuestas de usuarios.

**Detección automática:**
- El nodo detecta si el input es un webhook de WhatsApp
- Extrae automáticamente el número del remitente
- Identifica el ID de la opción seleccionada (en botones/listas)
- Aplica la lógica de cierre si corresponde

**Datos extraídos del webhook:**
```json
{
  "selectedId": "pizza_id",
  "isCloseAction": false,
  "webhookProcessed": true,
  "recipient": "+573001234567"
}
```

## Configuración avanzada

### Reintentos y tiempos de espera

**Parámetros:**
- **Number of Tries**: Cantidad de intentos de envío (1-10)
- **Message Wait Time**: Segundos de espera entre reintentos (0-60)

**Ejemplo:**
```
Number of Tries: 3
Message Wait Time: 5
```

Si el primer intento falla, esperará 5 segundos e intentará nuevamente, hasta 3 veces.

## Ejemplos de workflows completos

### Ejemplo 1: Menú de panadería con seguimiento

```
[Webhook Trigger - WhatsApp]
    ↓
[WhatsApp Message Node]
  Message Type: Interactive List
  Body Text: "¡Bienvenido a Panadería Artesanal! ¿Qué te gustaría ordenar?"
  Button Text: "Ver productos"
  Options:
    Pan integral|pan_int|Recién horneado, $3
    Croissant francés|croissant|Mantequilla premium, $2.5
    Torta de chocolate|torta_choc|Porción grande, $4
    Ver promociones|promos|Ofertas del día
    Cancelar pedido|cancelar|Cerrar conversación|true
    ↓
    ├─→ Continue → [IF Node - Verificar opción]
    │                  ↓
    │              [Procesar pedido específico]
    │                  ↓
    │              [Confirmar con botones]
    │                  ↓
    │              [WhatsApp Message - Confirmación]
    │
    └─→ Close → [Guardar en DB como "Abandonado"]
                    ↓
                [Fin del workflow]
```

### Ejemplo 2: Generación de reporte con espera

```
[Webhook Trigger]
    ↓
[WhatsApp Message - Confirmación]
  Message Type: Text
  Message: "Iniciando generación de reporte. Esto puede tomar 2-3 minutos..."
  Send Waiting Messages: ✓
  Wait Time: 30 segundos
  Interval: 45 segundos
  Waiting Messages:
    Procesando datos... por favor espera
    Casi listo... gracias por tu paciencia
  Max Messages: 4
    ↓
[HTTP Request - API externa - Generar reporte]
    ↓
[Code Node - Procesar datos]
    ↓
[WhatsApp Message - Envío de resultado]
  Message Type: Text
  Include Image: ✓
  Message: "¡Reporte generado exitosamente!"
```

### Ejemplo 3: Sistema de atención con CTA

```
[Webhook Trigger]
    ↓
[WhatsApp Message - Saludo]
  Message Type: Interactive Buttons
  Body: "¿Cómo podemos ayudarte hoy?"
  Buttons:
    Hacer un pedido|order
    Rastrear envío|track
    Atención al cliente|support
    ↓
[Switch Node - Basado en selectedId]
    ↓
    ├─→ Case 'support' → [WhatsApp Message - CTA]
    │                     Message Type: Call to Action
    │                     Body: "Puedes chatear con nuestro equipo"
    │                     Action: Abrir chat|url|https://wa.me/573001234567
    │
    ├─→ Case 'track' → [HTTP Request - API rastreo]
    │
    └─→ Case 'order' → [WhatsApp Message - Lista de productos]
```

## Solución de problemas

### El mensaje no se envía

**Verifica las credenciales:**
- Access Token válido y no expirado
- Phone Number ID correcto
- Permisos correctos en la app de Meta

**Formato del número:**
- Debe incluir `+` y código de país: `+573001234567`
- Sin espacios ni guiones
- Entre 10-15 dígitos después del `+`

**Créditos y límites:**
- Verifica que tengas créditos en tu cuenta de Meta
- Revisa los límites de envío diarios
- Confirma que el número esté verificado

### Error de autenticación (403)

- Regenera tu Access Token en Meta/Facebook
- Verifica que el token tenga los permisos: `whatsapp_business_messaging`
- Confirma que la app esté en modo producción
- Asegúrate de usar la API version correcta

### Las imágenes no se muestran

- La URL debe ser accesible públicamente (no localhost)
- La URL debe comenzar con `https://` (no `http://`)
- Formatos soportados: JPG, PNG, GIF, WEBP
- Tamaño máximo recomendado: 5MB

### Los mensajes de espera no funcionan

- `Send Waiting Messages` debe estar activado
- `Wait Time Before First Check` mínimo 5 segundos
- `Interval Between Messages` mínimo 10 segundos
- Verifica que haya al menos un mensaje en `Waiting Messages`
- `Max Messages` debe estar entre 1-20

### El output Close no se activa

- `Enable Close Detection` debe estar activado
- El ID de la opción debe estar en `Close Option IDs`
- O la opción debe terminar con `|true` en la configuración
- Verifica que el webhook esté enviando el `selectedId` correctamente

### Problemas con listas o botones

- **Listas**: Máximo 10 opciones
- **Botones**: Máximo 3 botones
- **CTA**: Solo 1 botón por mensaje
- Formato correcto: `Título|id|descripción|close`
- Los títulos de botones máximo 20 caracteres
- Los títulos de opciones de lista máximo 24 caracteres

## Limitaciones de la API de WhatsApp

- Máximo 3 botones interactivos por mensaje
- Máximo 10 opciones en listas interactivas
- Máximo 1 botón CTA por mensaje
- Los títulos de botones no pueden exceder 20 caracteres
- Los headers de imagen deben ser URLs públicas
- No se puede enviar Base64 directamente (solo URLs)
-Las imágenes en headers de listas se envían como mensaje separado (workaround automático para bug de WhatsApp API)

## Desarrollo

### Compilar el proyecto

```bash
npm run build
```

### Ejecutar lint

```bash
npm run lint
```

### Modo desarrollo

```bash
npm run dev
```

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Recursos adicionales

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [n8n Documentation](https://docs.n8n.io/)
- [Crear credenciales de WhatsApp Business](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started)
- [Mensajes interactivos de WhatsApp](https://developers.facebook.com/docs/whatsapp/guides/interactive-messages)

## Soporte

Para reportar bugs o solicitar features:
- [Abre un issue en GitHub](https://github.com/MayoB20/n8n-nodes-whatsapp-message/issues)
- Email: maryurialonso11@gmail.com

## Licencia

MIT © 2025 Maryuri

---