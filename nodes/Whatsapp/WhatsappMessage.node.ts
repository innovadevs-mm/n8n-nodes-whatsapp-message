import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';


export class WhatsappMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WhatsApp Message',
		name: 'whatsappMessage',
		icon: 'file:WhatsappMessage.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Envía mensajes de texto a través de WhatsApp Business API',
		defaults: {
			name: 'WhatsApp Message',
			color: '#25D366',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'whatsAppBusinessApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Message',
						value: 'sendMessage',
						description: 'Enviar un mensaje de WhatsApp',
						action: 'Send a WhatsApp message',
					},
				],
				default: 'sendMessage',
			},
			{
				displayName: 'Phone Number ID',
				name: 'phone_number_id',
				type: 'string',
				default: '',
				required: true,
				placeholder: '109876543210987',
				description: 'El ID del número de teléfono desde el que enviarás mensajes',
			},
			{
				displayName: 'Recipient Phone Number',
				name: 'recive_phone_number',
				type: 'string',
				default: '',
				required: true,
				placeholder: '+573001234567',
				description: 'Número de teléfono del destinatario (con código de país, ej: +573001234567)',
			},
			{
				displayName: 'API Version',
				name: 'version_api',
				type: 'options',
				options: [
					{
						name: 'v22.0',
						value: 'v22.0',
					},
					{
						name: 'v19.0',
						value: 'v19.0',
					},
				],
				default: 'v22.0',
				description: 'Versión de la API de WhatsApp Business',
			},
			{
				displayName: 'Main Message',
				name: 'main_message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Hola mundo',
				required: true,
				placeholder: 'Escribe tu mensaje aquí...',
				description: 'El mensaje que se enviará (máximo 4096 caracteres)',
			},
			{
				displayName: 'Require Waiting',
				name: 'require_waiting',
				type: 'boolean',
				default: false,
				description: 'Si se activa, esperará un tiempo antes de enviar el mensaje',
			},
			{
				displayName: 'Wait Time (seconds)',
				name: 'wait_time',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 300,
				},
				default: 5,
				description: 'Tiempo de espera en segundos antes de enviar',
				displayOptions: {
					show: {
						require_waiting: [true],
					},
				},
			},
			{
				displayName: 'Number of Tries',
				name: 'tries',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				default: 3,
				description: 'Número de intentos en caso de fallo',
			},
			{
				displayName: 'Message Wait Time (seconds)',
				name: 'message_wait_time',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 60,
				},
				default: 2,
				description: 'Tiempo de espera entre intentos de envío',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const phoneNumberId = this.getNodeParameter('phone_number_id', i) as string;
				let recipientPhone = this.getNodeParameter('recive_phone_number', i) as string;
				const apiVersion = this.getNodeParameter('version_api', i) as string;
				const requireWaiting = this.getNodeParameter('require_waiting', i) as boolean;
				const tries = this.getNodeParameter('tries', i) as number;
				const messageWaitTime = this.getNodeParameter('message_wait_time', i) as number;
				const mainMessage = this.getNodeParameter('main_message', i) as string;

				// Validaciones
				if (!mainMessage || mainMessage.trim().length === 0) {
					throw new Error('El mensaje no puede estar vacío');
				}

				if (mainMessage.length > 4096) {
					throw new Error('El mensaje excede el límite de 4096 caracteres');
				}

				// Normalizar número de teléfono - remover espacios y guiones
				recipientPhone = recipientPhone.replace(/[\s\-]/g, '');

				// Validar formato del teléfono
				if (!recipientPhone.startsWith('+')) {
					throw new Error('El número debe incluir el código de país con + (ej: +573001234567)');
				}

				if (!/^\+\d{10,15}$/.test(recipientPhone)) {
					throw new Error('Formato de teléfono inválido. Debe ser +[código país][número] (10-15 dígitos)');
				}

				const credentials = await this.getCredentials('whatsAppBusinessApi');
				const apiToken = credentials.accessToken as string;

				if (!apiToken) {
					throw new Error('Token de acceso no configurado en las credenciales');
				}

				// Esperar si es requerido
				if (requireWaiting) {
					const waitTime = this.getNodeParameter('wait_time', i) as number;
					await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
				}

				let response: any = null;
				let attempt = 0;
				let success = false;
				let lastError: any = null;

				// Reintentos
				while (attempt < tries && !success) {
					attempt++;

					try {
						const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

						response = await this.helpers.request({
							method: 'POST',
							url,
							headers: {
								'Authorization': `Bearer ${apiToken}`,
								'Content-Type': 'application/json',
							},
							body: {
								messaging_product: 'whatsapp',
								to: recipientPhone,
								type: 'text',
								text: {
									body: mainMessage,
								},
							},
							json: true,
						});

						success = true;

					} catch (error: any) {
						lastError = error;

						if (attempt < tries) {
							// Esperar antes de reintentar
							await new Promise(resolve => setTimeout(resolve, messageWaitTime * 1000));
						}
					}
				}

				if (!success) {
					throw lastError || new Error('No se pudo enviar el mensaje después de todos los intentos');
				}

				returnData.push({
					json: {
						success: true,
						attempt: attempt,
						operation: operation,
						message_id: response?.messages?.[0]?.id || null,
						recipient: recipientPhone,
						timestamp: new Date().toISOString(),
						response: response,
					},
				});

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message || 'Error desconocido',
							success: false,
							timestamp: new Date().toISOString(),
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}