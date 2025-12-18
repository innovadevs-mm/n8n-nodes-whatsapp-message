# n8n-nodes-whatsapp-message

Un nodo personalizado para n8n que permite enviar mensajes por WhatsApp utilizando la API de WhatsApp Business con soporte para mensajes de espera automáticos.

## Características

- ✅ Envía mensajes de texto por WhatsApp
- ✅ **Mensajes de espera automáticos** mientras se procesan tareas largas
- ✅ Soporte para **mensajes interactivos** (botones y listas)
- ✅ **Body JSON personalizado** para mensajes complejos
- ✅ Soporte para números internacionales
- ✅ Reintentos automáticos configurables
- ✅ Control de límite de mensajes para evitar spam
- ✅ Integración completa con n8n

Instalación
      ```bash
npm install n8n-nodes-whatsapp-message
      ```

O en n8n, ve a **Settings > Community Nodes** y busca `n8n-nodes-whatsapp-message`.

## Configuración

### Requisitos previos

1. Una cuenta de **WhatsApp Business API**
2. Tu **WABA ID** (WhatsApp Business Account ID)
3. Tu **Phone Number ID**
4. Un **Access Token** válido de Meta/Facebook

### Pasos de configuración

1. En n8n, abre tu workflow
2. Agrega el nodo **WhatsApp Message**
3. Haz clic en **Credentials** y selecciona **Create New Credentials**
4. Completa los campos:
   - **WABA ID**: Tu ID de cuenta de WhatsApp Business
   - **Phone Number ID**: El ID del número de teléfono
   - **Access Token**: Tu token de acceso (obtenido de Meta/Facebook)
   - **API Version**: Selecciona v22.0 o v19.0

## Uso

### Parámetros principales

 Básicos
-*Recipient Phone Number**: Número del destinatario en formato internacional (ej: `+573001234567`)
-*Main Message**: El texto del mensaje a enviar

 Configuración de Body Personalizado
-**Send Body**: Activa para enviar un body JSON personalizado
-**Body Content Type**: Selecciona JSON
-**Specify Body**:()
-**Using Fields Below**: Usa campos predefinidos o parámetros personalizados
-**Using JSON**: Escribe directamente el JSON completo

 Mensajes de Espera Automáticos
-**Send Waiting Messages**: Activa para enviar mensajes mientras se procesan tareas largas
-**Wait Time Before First Check**: Segundos antes del primer mensaje de espera (5-600)
-**Interval Between Messages**: Intervalo entre mensajes automáticos (10-300 segundos)
-**Waiting Messages**: Mensajes a enviar (uno por línea, se alternarán)
-**Max Messages**: Cantidad máxima de mensajes automáticos (1-20)

   Configuración Avanzada
-**Number of Tries**: Cantidad de intentos de envío (1-10)
-**Message Wait Time**: Segundos de espera entre reintentos (0-60)

### Ejemplos de uso

 Ejemplo 1: Mensaje simple
      ```
Recipient: +573001234567
Main Message: "Hola, este es un mensaje de prueba"
      ```

#### Ejemplo 2: Mensaje con espera automática
```
Recipient: +573001234567
Main Message: "Procesando tu solicitud, por favor espera..."
Send Waiting Messages: ✓ Activado
Wait Time Before First Check: 30 segundos
Interval Between Messages: 30 segundos
Waiting Messages:
  ¿Sigues ahí?
  Todavía estoy trabajando en ello... 
  Gracias por tu paciencia 
Max Messages: 5
```

Este ejemplo enviará el mensaje principal, esperará 30 segundos, y luego comenzará a enviar mensajes de espera cada 30 segundos hasta un máximo de 5 mensajes.

 Ejemplo 3: Mensaje interactivo con JSON
      ```
Send Body: ✓ Activado
Body Content Type: JSON
Specify Body: Using JSON

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+573001234567",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "¿Qué te gustaría hacer?"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "option_1",
            "title": "Ver más"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "option_2",
            "title": "Cancelar"
          }
        }
      ]
    }
  }
}
      ```

 Ejemplo 4: Usando Body Parameters
       ```
Send Body: ✓ Activado
Specify Body: Using Fields Below
Body Parameters:
  -Name: messaging_product, Value: whatsapp
  -Name: type, Value: text
  -Name: text, Value: {"body": "Tu mensaje aquí"}
         ```

Casos de uso
1.Notificaciones de procesos largos
Perfecto para workflows que toman tiempo (generación de reportes, procesamiento de datos, etc.) donde quieres mantener al usuario informado.

2.Confirmaciones y alertas
Envía confirmaciones de pedidos, alertas de inventario, notificaciones de eventos, etc.

3.Mensajes interactivos
Crea menús con botones o listas para que los usuarios puedan responder directamente.

4.Automatización de atención al cliente
Respuestas automáticas basadas en triggers específicos.

## Solución de problemas

El mensaje no se envía
-✓ Verifica que el **Access Token** sea válido
-✓ Confirma que el número esté en formato internacional (`+` seguido del código de país)
-✓ Asegúrate de que el número esté verificado en tu cuenta de WhatsApp Business
-✓ Revisa que el **Phone Number ID** sea correcto
-✓ Verifica que tengas créditos suficientes en tu cuenta de Meta

Error de autenticación (403)
-✓ Regenera tu **Access Token** en Meta/Facebook
-✓ Verifica que el token no haya expirado
-✓ Confirma que tienes los permisos correctos en tu app de Meta
-✓ Asegúrate de que la app esté en modo producción (no desarrollo)

Los mensajes de espera se envían sin control
-✓ Verifica el parámetro **Max Messages** (debe estar entre 1-20)
-✓ Ajusta el **Interval Between Messages** a un valor apropiado (mínimo 10 segundos)
-✓ Asegúrate de estar usando la última versión del nodo

Error de formato de JSON
-✓ Valida tu JSON en [jsonlint.com](https://jsonlint.com/)
-✓ Asegúrate de que el campo `to` tenga el número correcto
-✓ Verifica que la estructura siga el formato de la API de WhatsApp Business

## Desarrollo

Compilar el proyecto
      ```bash
npm run build
      ```

### Ejecutar lint
```bash
npm run lint
```
Modo desarrollo
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

## Changelog

v0.1.1
-Fix: Limitación correcta de mensajes de espera usando max_auto_messages
-Fix: Correcciones de lint para cumplir con estándares de n8n
-Mejora: Mejor manejo de tipos TypeScript
v0.1.0
-Lanzamiento inicial
-Soporte para mensajes de texto
-Mensajes de espera automáticos
-Soporte para body JSON personalizado
-Reintentos configurables

## Recursos adicionales

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [n8n Documentation](https://docs.n8n.io/)
- [Crear credenciales de WhatsApp Business](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started)

## Soporte

Para reportar bugs o solicitar features:
-[Abre un issue en GitHub](https://github.com/MayoB20/n8n-nodes-starter/issues)
-Email: maryurialonso11@gmail.com

## Licencia

MIT © 2025 Maryuri

---
