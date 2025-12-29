import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	sleep,
} from 'n8n-workflow';

export class WhatsappMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WhatsApp Message',
		name: 'whatsappMessage',
		icon: 'file:WhatsappMessage1.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["message_type"]}}',
		description: 'Envía mensajes de texto, listas o botones interactivos de WhatsApp',
		defaults: {
			name: 'WhatsApp Message',
		},
		usableAsTool: true,
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
				displayName: 'Recipient Phone Number',
				name: 'recive_phone_number',
				type: 'string',
				default: '',
				required: true,
				placeholder: '+573001234567',
				description: 'Número de teléfono del destinatario (con código de país)',
			},
			{
				displayName: 'Message Type',
				name: 'message_type',
				type: 'options',
				options: [
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Interactive List',
						value: 'list',
					},
					{
						name: 'Interactive Buttons',
						value: 'buttons',
					},
				],
				default: 'text',
			},
			
			{
				displayName: 'Message',
				name: 'main_message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Un momento por favor',
				required: true,
				displayOptions: {
					show: {
						message_type: ['text'],
					},
				},
			},

			{
				displayName: 'Body Text',
				name: 'list_body',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '¿Qué te gustaría hacer?',
				required: true,
				displayOptions: {
					show: {
						message_type: ['list'],
					},
				},
			},
			{
				displayName: 'Button Text',
				name: 'list_button',
				type: 'string',
				default: 'Ver opciones',
				required: true,
				displayOptions: {
					show: {
						message_type: ['list'],
					},
				},
			},
			{
				displayName: 'Header Type',
				name: 'list_header_type',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Image',
						value: 'image',
					},
				],
				default: 'none',
				displayOptions: {
					show: {
						message_type: ['list'],
					},
				},
			},
			{
				displayName: 'Header Text',
				name: 'list_header_text',
				type: 'string',
				default: '',
				placeholder: 'Welcome to our store!',
				displayOptions: {
					show: {
						message_type: ['list'],
						list_header_type: ['text'],
					},
				},
			},
			{
				displayName: 'Header Image URL',
				name: 'list_header_image_url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public URL of the image to show in header',
				displayOptions: {
					show: {
						message_type: ['list'],
						list_header_type: ['image'],
					},
				},
			},
			{
				displayName: 'Footer (Optional)',
				name: 'list_footer',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						message_type: ['list'],
					},
				},
			},
			{
				displayName: 'Options (One Per Line)',
				name: 'list_options_simple',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: 'Pizza|pizza_id|Delicious pizza\nPasta|pasta_id|Fresh pasta\nSalad|salad_id|Healthy salad',
				placeholder: 'Title|id|description',
				description: 'Format: Title|id|description (one option per line)',
				required: true,
				displayOptions: {
					show: {
						message_type: ['list'],
					},
				},
			},

			{
				displayName: 'Body Text',
				name: 'buttons_body',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '¿Cómo podemos ayudarte?',
				required: true,
				displayOptions: {
					show: {
						message_type: ['buttons'],
					},
				},
			},
			{
				displayName: 'Header Type',
				name: 'buttons_header_type',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Image',
						value: 'image',
					},
				],
				default: 'none',
				displayOptions: {
					show: {
						message_type: ['buttons'],
					},
				},
			},
			{
				displayName: 'Header Text',
				name: 'buttons_header_text',
				type: 'string',
				default: '',
				placeholder: 'Welcome!',
				displayOptions: {
					show: {
						message_type: ['buttons'],
						buttons_header_type: ['text'],
					},
				},
			},
			{
				displayName: 'Header Image URL',
				name: 'buttons_header_image_url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public URL of the image to show in header',
				displayOptions: {
					show: {
						message_type: ['buttons'],
						buttons_header_type: ['image'],
					},
				},
			},
			{
				displayName: 'Footer (Optional)',
				name: 'buttons_footer',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						message_type: ['buttons'],
					},
				},
			},
			{
				displayName: 'Buttons (One Per Line)',
				name: 'buttons_options',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Sí, me interesa|yes_button\nNo gracias|no_button\nMás información|info_button',
				placeholder: 'Button Text|button_id',
				description: 'Format: Button Text|button_id (one button per line, max 3 buttons)',
				required: true,
				displayOptions: {
					show: {
						message_type: ['buttons'],
					},
				},
			},

			{
				displayName: 'Send Waiting Messages',
				name: 'send_presence_check',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Wait Time Before First Check (Seconds)',
				name: 'wait_time_check',
				type: 'number',
				typeOptions: {
					minValue: 5,
					maxValue: 600,
				},
				default: 30,
				displayOptions: {
					show: {
						send_presence_check: [true],
					},
				},
			},
			{
				displayName: 'Interval Between Messages (Seconds)',
				name: 'message_interval',
				type: 'number',
				typeOptions: {
					minValue: 10,
					maxValue: 300,
				},
				default: 30,
				displayOptions: {
					show: {
						send_presence_check: [true],
					},
				},
			},
			{
				displayName: 'Waiting Messages',
				name: 'check_message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '¿Sigues ahí? \nGracias por tu paciencia ',
				displayOptions: {
					show: {
						send_presence_check: [true],
					},
				},
			},
			{
				displayName: 'Max Messages',
				name: 'max_auto_messages',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 20,
				},
				default: 5,
				displayOptions: {
					show: {
						send_presence_check: [true],
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
			},
			{
				displayName: 'Message Wait Time (Seconds)',
				name: 'message_wait_time',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 60,
				},
				default: 2,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const credentials = await this.getCredentials('whatsAppBusinessApi');
				const phoneNumberId = credentials.phoneNumberId as string;
				const apiToken = credentials.accessToken as string;
				const apiVersion = (credentials.version_api as string) || 'v22.0';

				if (!phoneNumberId || !apiToken) {
					throw new NodeOperationError(
						this.getNode(),
						'Credenciales no configuradas',
					);
				}

				let recipientPhone = this.getNodeParameter('recive_phone_number', i) as string;
				const messageType = this.getNodeParameter('message_type', i) as string;
				const sendPresenceCheck = this.getNodeParameter('send_presence_check', i) as boolean;
				const tries = this.getNodeParameter('tries', i) as number;
				const messageWaitTime = this.getNodeParameter('message_wait_time', i) as number;

				recipientPhone = recipientPhone.replace(/[\s-]/g, '');
				if (!recipientPhone.startsWith('+')) {
					throw new NodeOperationError(
						this.getNode(),
						'El número debe incluir el código de país con +',
					);
				}
				if (!/^\+\d{10,15}$/.test(recipientPhone)) {
					throw new NodeOperationError(
						this.getNode(),
						'Formato de teléfono inválido',
					);
				}

				const sendMessage = async (body: Record<string, unknown>): Promise<Record<string, unknown>> => {
					let attempt = 0;
					let lastError: Error | null = null;

					while (attempt < tries) {
						attempt++;
						try {
							const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
							const response = await this.helpers.httpRequest({
								method: 'POST',
								url,
								headers: {
									Authorization: `Bearer ${apiToken}`,
									'Content-Type': 'application/json',
								},
								body,
								json: true,
							});
							return response as Record<string, unknown>;
						} catch (error: any) {
							lastError = error as Error;
							
							if (error.response?.data) {
								throw new NodeOperationError(
									this.getNode(),
									`WhatsApp API Error: ${JSON.stringify(error.response.data)}`,
								);
							}
							
							if (attempt < tries) {
								await sleep(messageWaitTime * 1000);
							}
						}
					}
					throw lastError || new NodeOperationError(this.getNode(), 'No se pudo enviar el mensaje');
				};

				const sentMessages: Array<{
					message: string;
					messageId: string | null;
					timestamp: string;
					type: string;
				}> = [];

				let mainMessageBody: Record<string, unknown>;
				let mainMessageText: string;

				if (messageType === 'buttons') {
					const buttonsBody = this.getNodeParameter('buttons_body', i) as string;
					const buttonsHeaderType = this.getNodeParameter('buttons_header_type', i, 'none') as string;
					const buttonsFooter = this.getNodeParameter('buttons_footer', i, '') as string;
					const buttonsRaw = this.getNodeParameter('buttons_options', i) as string;

					if (!buttonsBody.trim()) {
						throw new NodeOperationError(this.getNode(), 'Body es requerido');
					}

					const buttonLines = buttonsRaw.split('\n').filter(line => line.trim());
					
					if (buttonLines.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Debes agregar al menos un botón');
					}

					if (buttonLines.length > 3) {
						throw new NodeOperationError(this.getNode(), `Máximo 3 botones. Tienes ${buttonLines.length}`);
					}

					const buttons = buttonLines.map((line, index) => {
						const parts = line.split('|').map(p => p.trim());
						
						if (parts.length < 2) {
							throw new NodeOperationError(
								this.getNode(),
								`Línea ${index + 1}: Formato inválido. Usa: Button Text|button_id`,
							);
						}

						if (parts[0].length > 20) {
							throw new NodeOperationError(
								this.getNode(),
								`Botón ${index + 1}: El texto no puede exceder 20 caracteres`,
							);
						}

						return {
							type: 'reply',
							reply: {
								id: parts[1],
								title: parts[0],
							},
						};
					});

					const interactive: Record<string, unknown> = {
						type: 'button',
						body: { text: buttonsBody.trim() },
						action: { buttons },
					};

					if (buttonsHeaderType && buttonsHeaderType !== 'none') {
						if (buttonsHeaderType === 'text') {
							const buttonsHeaderText = this.getNodeParameter('buttons_header_text', i, '') as string;
							if (buttonsHeaderText && buttonsHeaderText.trim().length > 0) {
								interactive.header = {
									type: 'text',
									text: buttonsHeaderText.trim(),
								};
							}
						} else if (buttonsHeaderType === 'image') {
							const buttonsHeaderImageUrl = this.getNodeParameter('buttons_header_image_url', i, '') as string;
							if (buttonsHeaderImageUrl && buttonsHeaderImageUrl.trim().length > 0) {
								interactive.header = {
									type: 'image',
									image: {
										link: buttonsHeaderImageUrl.trim(),
									},
								};
							}
						}
					}

					if (buttonsFooter.trim()) {
						interactive.footer = { text: buttonsFooter.trim() };
					}

					mainMessageBody = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: recipientPhone,
						type: 'interactive',
						interactive,
					};

					mainMessageText = `Buttons: ${buttonsBody}`;

				} else if (messageType === 'list') {
					const listBody = this.getNodeParameter('list_body', i) as string;
					const listButton = this.getNodeParameter('list_button', i) as string;
					const listHeaderType = this.getNodeParameter('list_header_type', i, 'none') as string;
					const listFooter = this.getNodeParameter('list_footer', i, '') as string;
					const optionsRaw = this.getNodeParameter('list_options_simple', i) as string;

					if (!listBody.trim() || !listButton.trim()) {
						throw new NodeOperationError(this.getNode(), 'Body y Button son requeridos');
					}

					const optionLines = optionsRaw.split('\n').filter(line => line.trim());
					
					if (optionLines.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Debes agregar al menos una opción');
					}

					if (optionLines.length > 10) {
						throw new NodeOperationError(this.getNode(), `Máximo 10 opciones. Tienes ${optionLines.length}`);
					}

					const rows = optionLines.map((line, index) => {
						const parts = line.split('|').map(p => p.trim());
						
						if (parts.length < 2) {
							throw new NodeOperationError(
								this.getNode(),
								`Línea ${index + 1}: Formato inválido. Usa: Title|id|description`,
							);
						}

						const row: Record<string, string> = {
							id: parts[1],
							title: parts[0],
						};

						if (parts[2]) {
							row.description = parts[2];
						}

						return row;
					});

					const interactive: Record<string, unknown> = {
						type: 'list',
						body: { text: listBody.trim() },
						action: {
							button: listButton.trim(),
							sections: [{ rows }],
						},
					};

					if (listHeaderType && listHeaderType !== 'none') {
						if (listHeaderType === 'text') {
							const listHeaderText = this.getNodeParameter('list_header_text', i, '') as string;
							if (listHeaderText && listHeaderText.trim().length > 0) {
								interactive.header = {
									type: 'text',
									text: listHeaderText.trim(),
								};
							}
						} else if (listHeaderType === 'image') {
							const listHeaderImageUrl = this.getNodeParameter('list_header_image_url', i, '') as string;
							if (listHeaderImageUrl && listHeaderImageUrl.trim().length > 0) {
								interactive.header = {
									type: 'image',
									image: {
										link: listHeaderImageUrl.trim(),
									},
								};
							}
						}
					}

					if (listFooter.trim()) {
						interactive.footer = { text: listFooter.trim() };
					}

					mainMessageBody = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: recipientPhone,
						type: 'interactive',
						interactive,
					};

					mainMessageText = `Lista: ${listBody}`;

				} else {
					const mainMessage = this.getNodeParameter('main_message', i) as string;

					if (!mainMessage.trim()) {
						throw new NodeOperationError(this.getNode(), 'El mensaje no puede estar vacío');
					}

					mainMessageBody = {
						messaging_product: 'whatsapp',
						to: recipientPhone,
						type: 'text',
						text: { body: mainMessage.trim() },
					};

					mainMessageText = mainMessage.trim();
				}

				console.log('=== MESSAGE BODY ===');
				console.log(JSON.stringify(mainMessageBody, null, 2));
				console.log('===================');

				const mainResponse = await sendMessage(mainMessageBody);
				const messages = mainResponse.messages as Array<{id: string}> | undefined;
				sentMessages.push({
					message: mainMessageText,
					messageId: messages?.[0]?.id || null,
					timestamp: new Date().toISOString(),
					type: 'main',
				});

				if (sendPresenceCheck) {
					const waitTimeCheck = this.getNodeParameter('wait_time_check', i) as number;
					const messageInterval = this.getNodeParameter('message_interval', i) as number;
					const checkMessagesRaw = this.getNodeParameter('check_message', i) as string;
					const maxAutoMessages = this.getNodeParameter('max_auto_messages', i) as number;

					const checkMessages = checkMessagesRaw
						.split('\n')
						.map(msg => msg.trim())
						.filter(msg => msg.length > 0);

					if (checkMessages.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Los mensajes de espera no pueden estar vacíos');
					}

					await sleep(waitTimeCheck * 1000);

					let messageIndex = 0;
					let messagesSent = 0;

					const firstMessage = checkMessages[messageIndex % checkMessages.length];
					messageIndex++;
					messagesSent++;

					const firstAutoBody = {
						messaging_product: 'whatsapp',
						to: recipientPhone,
						type: 'text',
						text: { body: firstMessage },
					};

					const firstResponse = await sendMessage(firstAutoBody);
					const firstMessages = firstResponse.messages as Array<{id: string}> | undefined;
					sentMessages.push({
						message: firstMessage,
						messageId: firstMessages?.[0]?.id || null,
						timestamp: new Date().toISOString(),
						type: 'presence_check',
					});

					void (async () => {
						while (messagesSent < maxAutoMessages) {
							await sleep(messageInterval * 1000);
							
							if (messagesSent >= maxAutoMessages) {
								break;
							}

							const currentMessage = checkMessages[messageIndex % checkMessages.length];
							messageIndex++;
							messagesSent++;

							const autoBody = {
								messaging_product: 'whatsapp',
								to: recipientPhone,
								type: 'text',
								text: { body: currentMessage },
							};

							try {
								const response = await sendMessage(autoBody);
								const responseMessages = response.messages as Array<{id: string}> | undefined;
								sentMessages.push({
									message: currentMessage,
									messageId: responseMessages?.[0]?.id || null,
									timestamp: new Date().toISOString(),
									type: 'presence_check',
								});
							} catch {
							}
						}
					})();
				}

				returnData.push({
					json: {
						success: true,
						recipient: recipientPhone,
						messageType,
						totalMessagesSent: sentMessages.length,
						presenceCheckSent: sendPresenceCheck,
						messages: sentMessages,
						timestamp: new Date().toISOString(),
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message || 'Error desconocido',
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