n8n-nodes-whatsapp-message

Un nodo personalizado para n8n que permite enviar mensajes por WhatsApp utilizando la API de WhatsApp Business.

Características

- ✅ Envía mensajes de texto por WhatsApp
- ✅ Soporte para números internacionales
- ✅ Reintentos automáticos configurables
- ✅ Tiempos de espera personalizables
- ✅ Integración completa con n8n

Instalación

```bash
npm install n8n-nodes-whatsapp-message
```

O en n8n, ve a **Community Nodes** y busca `n8n-nodes-whatsapp-message`.

Configuración

Requisitos previos

1. Una cuenta de **WhatsApp Business API**
2. Tu **WABA ID** (WhatsApp Business Account ID)
3. Tu **Phone Number ID**
4. Un **Access Token** válido

Pasos de configuración

1. En n8n, abre tu workflow
2. Agrega el nodo **WhatsApp Message**
3. Haz clic en **Credentials** y selecciona **WhatsApp Business Account**
4. Completa los campos:
   - **WABA ID**: Tu ID de cuenta de WhatsApp Business
   - **Phone Number ID**: El ID del número de teléfono
   - **Access Token**: Tu token de acceso (obtenido de Meta/Facebook)

Uso

Parámetros principales

- **Recipient Phone Number**: Número del destinatario (ej: +573001234567)
- **Main Message**: El texto del mensaje a enviar
- **API Version**: Versión de la API (v22.0 por defecto)
- **Require Waiting**: Activar tiempos de espera entre reintentos
- **Wait Time**: Segundos de espera entre reintentos
- **Number of Tries**: Cantidad de intentos de envío

Ejemplo de uso

1. Crea un workflow en n8n
2. Agrega un trigger (por ejemplo, webhook)
3. Agrega el nodo **WhatsApp Message**
4. Configura:
   - Número del destinatario: `+573001234567`
   - Mensaje: `Hola, este es un mensaje de prueba`
   - Reintentos: 3
   - Tiempo de espera: 5 segundos
5. Ejecuta el workflow

Solución de problemas

El mensaje no se envía
- Verifica que el **Access Token** sea válido
- Confirma que el número esté en formato internacional (+57...)
- Asegúrate de que el número esté verificado en tu cuenta de WhatsApp Business
- Revisa que el **Phone Number ID** sea correcto

 Error de autenticación
- Regenera tu **Access Token** en Meta/Facebook
- Verifica que el token no haya expirado
- Confirma que tienes los permisos correctos en tu app de Meta

Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.

Licencia

MIT

Autor

Maryuri - maryurialonso11@gmail.com