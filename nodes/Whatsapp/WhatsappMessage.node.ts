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
		icon: 'file:WhatsappMessage.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Mensaje de espera',
		description: 'Envía un mensaje y opcionalmente pregunta si el usuario sigue ahí después de un tiempo',
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
				displayName: 'Main Message',
				name: 'main_message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Un momento por favor, estoy procesando tu solicitud...',
				required: true,
				placeholder: 'Escribe tu mensaje de espera...',
				description: 'Mensaje principal que se enviará',
			},
			{
				displayName: 'Send Body',
				name: 'send_body',
				type: 'boolean',
				default: false,
				description: 'Whether to send a custom body in JSON format',
			},
			{
				displayName: 'Body Content Type',
				name: 'body_content_type',
				type: 'options',
				options: [
					{
						name: 'Form Urlencoded',
						value: 'form-urlencoded',
					},
					{
						name: 'Form-Data',
						value: 'form-data',	
					},
					{
						name: 'JSON',
						value: 'json',
					},
					{
						name: 'N8n Binary File',
						value: 'binary',
					},
					{
						name: 'Raw',
						value: 'raw',
					},
				],
				default: 'json',
				description: 'Tipo de contenido del body',
				displayOptions: {
					show: {
						send_body: [true],
					},
				},
			},
			{
				displayName: 'Specify Body',
				name: 'specify_body',
				type: 'options',
				options: [
					{
						name: 'Using Fields Below',
						value: 'fields',
					},
					{
						name: 'Using JSON',
						value: 'json',
					},
				],
				default: 'json',
				description: 'Cómo especificar el body',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
					},
				},
			},
			{
				displayName: 'Body Parameters',
				name: 'body_parameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Parameter',
				description: 'Parámetros del body',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
						specify_body: ['fields'],
					},
				},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Nombre del parámetro',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Valor del parámetro',
							},
						],
					},
				],
			},
			{
				displayName: 'Message Type',
				name: 'body_message_type',
				type: 'options',
				options: [
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Interactive',
						value: 'interactive',
					},
					{
						name: 'Template',
						value: 'template',
					},
				],
				default: 'text',
				description: 'Tipo de mensaje de WhatsApp',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
						specify_body: ['fields'],
					},
				},
			},
			{
				displayName: 'Body Text',
				name: 'body_text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Escribe el texto del mensaje...',
				description: 'Contenido del mensaje',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
						specify_body: ['fields'],
						body_message_type: ['text'],
					},
				},
			},
			{
				displayName: 'Interactive Type',
				name: 'interactive_type',
				type: 'options',
				options: [
					{
						name: 'Button',
						value: 'button',
					},
					{
						name: 'List',
						value: 'list',
					},
				],
				default: 'button',
				description: 'Tipo de mensaje interactivo',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
						specify_body: ['fields'],
						body_message_type: ['interactive'],
					},
				},
			},
			{
				displayName: 'Interactive Body Text',
				name: 'interactive_body_text',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				placeholder: '¿Qué te gustaría hacer?',
				description: 'Texto del mensaje interactivo',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
						specify_body: ['fields'],
						body_message_type: ['interactive'],
					},
				},
			},
			{
				displayName: 'JSON',
				name: 'body_json',
				type: 'json',
				default: '',
				required: true,
				description: 'Body personalizado en formato JSON',
				displayOptions: {
					show: {
						send_body: [true],
						body_content_type: ['json'],
						specify_body: ['json'],
					},
				},
			},
			{
				displayName: 'Send Waiting Messages',
				name: 'send_presence_check',
				type: 'boolean',
				default: false,
				description: 'Whether to send waiting messages while the workflow continues processing',
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
				description: 'Tiempo de espera antes de enviar el primer mensaje',
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
				description: 'Intervalo entre mensajes',
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
				default: '¿Sigues ahí? \nTodavía estoy trabajando en ello... \nGracias por tu paciencia ',
				placeholder: 'Un mensaje por línea...',
				description: 'Mensajes que se enviarán (uno por línea, se alternarán)',
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
				description: 'Número máximo de mensajes a enviar (para evitar spam infinito)',
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
				description: 'Número de intentos en caso de fallo al enviar',
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
				description: 'Tiempo de espera entre intentos fallidos',
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

				if (!phoneNumberId) {
					throw new NodeOperationError(
						this.getNode(),
						'Phone Number ID no configurado en las credenciales',
					);
				}
				if (!apiToken) {
					throw new NodeOperationError(
						this.getNode(),
						'Token de acceso no configurado en las credenciales',
					);
				}

				let recipientPhone = this.getNodeParameter('recive_phone_number', i) as string;
				const sendBody = this.getNodeParameter('send_body', i) as boolean;
				const sendPresenceCheck = this.getNodeParameter('send_presence_check', i) as boolean;
				const tries = this.getNodeParameter('tries', i) as number;
				const messageWaitTime = this.getNodeParameter('message_wait_time', i) as number;

				recipientPhone = recipientPhone.replace(/[\s-]/g, '');
				if (!recipientPhone.startsWith('+')) {
					throw new NodeOperationError(
						this.getNode(),
						'El número debe incluir el código de país con + (ej: +573001234567)',
					);
				}
				if (!/^\+\d{10,15}$/.test(recipientPhone)) {
					throw new NodeOperationError(
						this.getNode(),
						'Formato de teléfono inválido. Debe ser +[código país][número] (10-15 dígitos)',
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
						} catch (error) {
							lastError = error as Error;
							if (attempt < tries) {
								await sleep(messageWaitTime * 1000);
							}
						}
					}
					throw lastError || new NodeOperationError(this.getNode(), 'No se pudo enviar el mensaje después de todos los intentos');
				};

				const sentMessages: Array<{
					message: string;
					messageId: string | null;
					timestamp: string;
					type: string;
				}> = [];

				let mainMessageBody: Record<string, unknown>;
				let mainMessageText: string;

				if (sendBody) {
					const bodyContentType = this.getNodeParameter('body_content_type', i) as string;

					if (bodyContentType === 'json') {
						const specifyBody = this.getNodeParameter('specify_body', i) as string;

						if (specifyBody === 'fields') {
							const bodyParametersData = this.getNodeParameter('body_parameters', i, {}) as Record<string, unknown>;
							const parameters = (bodyParametersData?.parameter || []) as Array<{name: string; value: string}>;

							if (parameters.length > 0) {
								mainMessageBody = {};

								for (const param of parameters) {
									if (param.name && param.value !== undefined) {
										try {
											mainMessageBody[param.name] = JSON.parse(param.value);
										} catch {
											mainMessageBody[param.name] = param.value;
										}
									}
								}

								mainMessageBody.to = recipientPhone;

								const body = mainMessageBody as {
									text?: { body?: string };
									interactive?: { body?: { text?: string } };
								};

								if (body.text?.body) {
									mainMessageText = body.text.body;
								} else if (body.interactive?.body?.text) {
									mainMessageText = body.interactive.body.text;
								} else {
									mainMessageText = 'Custom body message from parameters';
								}
							} else {
								const bodyMessageType = this.getNodeParameter('body_message_type', i) as string;

								if (bodyMessageType === 'text') {
									const bodyText = this.getNodeParameter('body_text', i) as string;

									if (!bodyText || bodyText.trim().length === 0) {
										throw new NodeOperationError(
											this.getNode(),
											'El texto del body no puede estar vacío',
										);
									}

									mainMessageBody = {
										messaging_product: 'whatsapp',
										to: recipientPhone,
										type: 'text',
										text: {
											body: bodyText,
										},
									};
									mainMessageText = bodyText;
								} else if (bodyMessageType === 'interactive') {
									const interactiveType = this.getNodeParameter('interactive_type', i) as string;
									const interactiveBodyText = this.getNodeParameter(
										'interactive_body_text',
										i,
									) as string;

									if (!interactiveBodyText || interactiveBodyText.trim().length === 0) {
										throw new NodeOperationError(
											this.getNode(),
											'El texto del mensaje interactivo no puede estar vacío',
										);
									}

									mainMessageBody = {
										messaging_product: 'whatsapp',
										to: recipientPhone,
										type: 'interactive',
										interactive: {
											type: interactiveType,
											body: {
												text: interactiveBodyText,
											},
											action:
												interactiveType === 'button'
													? {
															buttons: [
																{
																	type: 'reply',
																	reply: {
																		id: 'option_1',
																		title: 'Opción 1',
																	},
																},
															],
													  }
													: {
															button: 'Ver opciones',
															sections: [
																{
																	title: 'Opciones',
																	rows: [
																		{
																			id: 'row_1',
																			title: 'Opción 1',
																			description: 'Descripción',
																		},
																	],
																},
															],
													  },
										},
									};
									mainMessageText = interactiveBodyText;
								} else {
									throw new NodeOperationError(
										this.getNode(),
										'Tipo de mensaje no soportado en Fields',
									);
								}
							}
						} else {
							const bodyJson = this.getNodeParameter('body_json', i) as string;

							try {
								mainMessageBody = JSON.parse(bodyJson) as Record<string, unknown>;

								mainMessageBody.to = recipientPhone;

								const body = mainMessageBody as {
									text?: { body?: string };
									interactive?: { body?: { text?: string } };
								};

								if (body.text?.body) {
									mainMessageText = body.text.body;
								} else if (body.interactive?.body?.text) {
									mainMessageText = body.interactive.body.text;
								} else {
									mainMessageText = 'Custom body message';
								}
							} catch {
								throw new NodeOperationError(this.getNode(), 'El JSON del body no es válido');
							}
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Solo se soporta el tipo de contenido JSON en esta versión',
						);
					}
				} else {
					const mainMessage = this.getNodeParameter('main_message', i) as string;

					if (!mainMessage || mainMessage.trim().length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'El mensaje principal no puede estar vacío',
						);
					}
					if (mainMessage.length > 4096) {
						throw new NodeOperationError(
							this.getNode(),
							'El mensaje excede el límite de 4096 caracteres',
						);
					}

					mainMessageBody = {
						messaging_product: 'whatsapp',
						to: recipientPhone,
						type: 'text',
						text: {
							body: mainMessage,
						},
					};
					mainMessageText = mainMessage;
				}

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
						.map((msg) => msg.trim())
						.filter((msg) => msg.length > 0);

					if (checkMessages.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'El mensaje de verificación no puede estar vacío',
						);
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
							} catch (error) {
								void error;	
							}
						}
					})();
				}

				returnData.push({
					json: {
						success: true,
						recipient: recipientPhone,
						usedCustomBody: sendBody,
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