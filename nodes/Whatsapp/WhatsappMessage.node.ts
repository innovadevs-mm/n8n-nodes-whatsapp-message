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
		icon: 'file:WhatsappMessage2.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["message_type"]}}',
		description: 'Envía mensajes de texto, listas o botones interactivos de WhatsApp',
		defaults: {
			name: 'WhatsApp Message',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main', 'main'],
		outputNames: ['Continue', 'Close'],
		credentials: [
			{
				name: 'whatsAppBusinessApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Enable Close Detection',
				name: 'enable_close_detection',
				type: 'boolean',
				default: false,
				description: 'Whether the node automatically detects when the user selects a close option',
			},
			{
				displayName: 'Close Option IDs',
				name: 'close_option_ids',
				type: 'string',
				default: '',
				placeholder: 'exit_id,salir_id,close_id',
				description: 'IDs de las opciones que cierran la conversación separados por comas',
				displayOptions: {
					show: {
						enable_close_detection: [true],
					},
				},
			},
			{
				displayName: 'Goodbye Message',
				name: 'goodbye_message',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: 'Gracias por contactarnos. Hasta pronto',
				description: 'Mensaje automático que se envía cuando se detecta una opción de cierre',
				displayOptions: {
					show: {
						enable_close_detection: [true],
					},
				},
			},
			{
				displayName: 'Recipient Phone Number',
				name: 'recive_phone_number',
				type: 'string',
				default: '',
				placeholder: '+573001234567',
				description: 'Número de teléfono del destinatario con código de país',
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
					{
						name: 'Call to Action',
						value: 'cta',
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
				displayOptions: {
					show: {
						message_type: ['text'],
					},
				},
			},
			{
				displayName: 'Include Image',
				name: 'text_include_image',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						message_type: ['text'],
					},
				},
			},
			{
				displayName: 'Image URL',
				name: 'text_image_url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				displayOptions: {
					show: {
						message_type: ['text'],
						text_include_image: [true],
					},
				},
			},
			{
				displayName: 'Caption',
				name: 'text_image_caption',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				displayOptions: {
					show: {
						message_type: ['text'],
						text_include_image: [true],
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
				default: 'Que te gustaria hacer',
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
				description: 'Tipo de header. NOTA: Las imagenes en listas se envian como mensaje separado primero (workaround de WhatsApp API)',
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
				displayOptions: {
					show: {
						message_type: ['list'],
						list_header_type: ['image'],
					},
				},
			},
			{
				displayName: 'Footer',
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
				displayName: 'Options',
				name: 'list_options_simple',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: 'Pizza|pizza_id|Delicious pizza\nPasta|pasta_id|Fresh pasta\nSalir|exit_id|Terminar conversacion|true',
				placeholder: 'Titulo|ID|descripcion|close',
				description: 'Una opcion por linea. Formato: Titulo|ID|descripcion|close. La descripcion es opcional. Agregar |true al final marca la opcion como cierre. Maximo 10 opciones.',
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
				default: 'Como podemos ayudarte',
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
				displayOptions: {
					show: {
						message_type: ['buttons'],
						buttons_header_type: ['image'],
					},
				},
			},
			{
				displayName: 'Footer',
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
				displayName: 'Buttons',
				name: 'buttons_options',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Si me interesa|yes_button\nNo gracias|no_button|true\nMas informacion|info_button',
				placeholder: 'Texto del boton|button_id|close',
				description: 'Un boton por linea. Formato: Texto del boton|button_id|close. Agregar |true al final marca el boton como cierre. Maximo 3 botones. El texto debe tener maximo 20 caracteres.',
				displayOptions: {
					show: {
						message_type: ['buttons'],
					},
				},
			},
			{
				displayName: 'Body Text',
				name: 'cta_body',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: 'Te gustaria visitarnos',
				displayOptions: {
					show: {
						message_type: ['cta'],
					},
				},
			},
			{
				displayName: 'Header Type',
				name: 'cta_header_type',
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
						message_type: ['cta'],
					},
				},
			},
			{
				displayName: 'Header Text',
				name: 'cta_header_text',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						message_type: ['cta'],
						cta_header_type: ['text'],
					},
				},
			},
			{
				displayName: 'Header Image URL',
				name: 'cta_header_image_url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				displayOptions: {
					show: {
						message_type: ['cta'],
						cta_header_type: ['image'],
					},
				},
			},
			{
				displayName: 'Footer',
				name: 'cta_footer',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						message_type: ['cta'],
					},
				},
			},
			{
				displayName: 'Action Buttons',
				name: 'cta_buttons',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Visit Website|url|https://example.com',
				placeholder: 'Ver sitio|url|https://ejemplo.com',
				description: 'Formato: Texto del boton|url|URL completa. El texto debe tener maximo 20 caracteres. Solo se permite 1 boton CTA.',
				displayOptions: {
					show: {
						message_type: ['cta'],
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
				default: 'Sigues ahi\nGracias por tu paciencia',
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
		const continue_data: INodeExecutionData[] = [];
		const close_data: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const item = items[i];
				const item_json = item.json;

				const is_webhook = item_json.entry && item_json.object === 'whatsapp_business_account';

				if (is_webhook) {
					const credentials = await this.getCredentials('whatsAppBusinessApi');
					const phone_number_id = credentials.phoneNumberId as string;
					const api_token = credentials.accessToken as string;
					const api_version = (credentials.version_api as string) || 'v22.0';

					const webhook_entry = item_json.entry as Array<Record<string, unknown>>;
					if (!webhook_entry || webhook_entry.length === 0) {
						continue_data.push(item);
						continue;
					}

					const changes = webhook_entry[0].changes as Array<Record<string, unknown>>;
					if (!changes || changes.length === 0) {
						continue_data.push(item);
						continue;
					}

					const value = changes[0].value as {messages?: Array<Record<string, unknown>>};
					const messages = value?.messages;
					if (!messages || messages.length === 0) {
						continue_data.push(item);
						continue;
					}

					const user_message = messages[0];
					const recipient_phone = user_message.from as string;

					let selected_id = '';
					if (user_message.type === 'interactive') {
						const interactive = user_message.interactive as Record<string, unknown>;
						if (interactive?.type === 'button_reply') {
							const button_reply = interactive.button_reply as {id: string};
							selected_id = button_reply.id;
						} else if (interactive?.type === 'list_reply') {
							const list_reply = interactive.list_reply as {id: string};
							selected_id = list_reply.id;
						}
					}

					const enable_close_detection = this.getNodeParameter('enable_close_detection', i, false) as boolean;
					let is_close_action = false;

					if (enable_close_detection && selected_id) {
						const close_option_ids_param = this.getNodeParameter('close_option_ids', i, '') as string;
						if (close_option_ids_param.trim()) {
							const close_ids = close_option_ids_param.split(',').map(id => id.trim());
							is_close_action = close_ids.includes(selected_id);
						}
					}

					const output_data: INodeExecutionData = {
						json: {
							...item_json,
							selectedId: selected_id,
							isCloseAction: is_close_action,
							webhookProcessed: true,
							recipient: recipient_phone,
						},
					};

					if (is_close_action) {
						const goodbye_message = this.getNodeParameter('goodbye_message', i, '') as string;
						if (goodbye_message.trim()) {
							const goodbye_body = {
								messaging_product: 'whatsapp',
								to: recipient_phone,
								type: 'text',
								text: { body: goodbye_message.trim() },
							};

							const url = `https://graph.facebook.com/${api_version}/${phone_number_id}/messages`;
							const response = await this.helpers.httpRequest({
								method: 'POST',
								url,
								headers: {
									Authorization: `Bearer ${api_token}`,
									'Content-Type': 'application/json',
								},
								body: goodbye_body,
								json: true,
							});

							output_data.json.goodbyeSent = true;
							output_data.json.goodbyeMessageId = (response as {messages?: Array<{id: string}>}).messages?.[0]?.id || null;
							output_data.json.goodbyeTimestamp = new Date().toISOString();
						}
						close_data.push(output_data);
					} else {
						continue_data.push(output_data);
					}

					continue;
				}

				const credentials = await this.getCredentials('whatsAppBusinessApi');
				const phone_number_id = credentials.phoneNumberId as string;
				const api_token = credentials.accessToken as string;
				const api_version = (credentials.version_api as string) || 'v22.0';

				if (!phone_number_id || !api_token) {
					throw new NodeOperationError(
						this.getNode(),
						'Credenciales no configuradas',
					);
				}

				let recipient_phone = this.getNodeParameter('recive_phone_number', i, '') as string;
				const message_type = this.getNodeParameter('message_type', i, 'text') as string;
				const send_presence_check = this.getNodeParameter('send_presence_check', i, false) as boolean;
				const tries = this.getNodeParameter('tries', i, 3) as number;
				const message_wait_time = this.getNodeParameter('message_wait_time', i, 2) as number;

				if (!recipient_phone) {
					throw new NodeOperationError(
						this.getNode(),
						'Recipient Phone Number es requerido',
					);
				}

				recipient_phone = recipient_phone.replace(/[\s-]/g, '');
				if (!recipient_phone.startsWith('+')) {
					throw new NodeOperationError(
						this.getNode(),
						'El numero debe incluir el codigo de pais con +',
					);
				}
				if (!/^\+\d{10,15}$/.test(recipient_phone)) {
					throw new NodeOperationError(
						this.getNode(),
						'Formato de telefono invalido',
					);
				}

				const SendMessage = async (body: Record<string, unknown>): Promise<Record<string, unknown>> => {
					let attempt = 0;
					let last_error: Error | null = null;

					while (attempt < tries) {
						attempt++;
						try {
							const url = `https://graph.facebook.com/${api_version}/${phone_number_id}/messages`;
							const response = await this.helpers.httpRequest({
								method: 'POST',
								url,
								headers: {
									Authorization: `Bearer ${api_token}`,
									'Content-Type': 'application/json',
								},
								body,
								json: true,
							});
							return response as Record<string, unknown>;
						} catch (error: unknown) {
							last_error = error as Error;
							
							const err = error as {response?: {data?: unknown}};
							if (err.response?.data) {
								throw new NodeOperationError(
									this.getNode(),
									`WhatsApp API Error: ${JSON.stringify(err.response.data)}`,
								);
							}
							
							if (attempt < tries) {
								await sleep(message_wait_time * 1000);
							}
						}
					}
					throw last_error || new NodeOperationError(this.getNode(), 'No se pudo enviar el mensaje');
				};

				const ValidateImageUrl = (url: string | undefined): string => {
					if (!url || !url.trim().startsWith('http')) {
						throw new NodeOperationError(
							this.getNode(),
							'Image URL invalida o vacia. Debe comenzar con http:// o https://'
						);
					}
					return url.trim();
				};

				const sent_messages: Array<{
					message: string;
					messageId: string | null;
					timestamp: string;
					type: string;
				}> = [];

				let main_message_body: Record<string, unknown>;
				let main_message_text: string;

				if (message_type === 'buttons') {
					const buttons_body = this.getNodeParameter('buttons_body', i, '') as string;
					const buttons_header_type = this.getNodeParameter('buttons_header_type', i, 'none') as string;
					const buttons_footer = this.getNodeParameter('buttons_footer', i, '') as string;
					const buttons_raw = this.getNodeParameter('buttons_options', i, '') as string;

					if (!buttons_body.trim()) {
						throw new NodeOperationError(this.getNode(), 'Body es requerido');
					}

					const button_lines = buttons_raw.split('\n').filter(line => line.trim());
					
					if (button_lines.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Debes agregar al menos un boton');
					}

					if (button_lines.length > 3) {
						throw new NodeOperationError(this.getNode(), `Maximo 3 botones. Tienes ${button_lines.length}`);
					}

					const button_data = button_lines.map((line, index) => {
						const parts = line.split('|').map(p => p.trim());
						
						if (parts.length < 2) {
							throw new NodeOperationError(
								this.getNode(),
								`Linea ${index + 1}: Formato invalido. Usa: Button Text|button_id|close`,
							);
						}

						if (parts[0].length > 20) {
							throw new NodeOperationError(
								this.getNode(),
								`Boton ${index + 1}: El texto no puede exceder 20 caracteres`,
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
						body: { text: buttons_body.trim() },
						action: { buttons: button_data },
					};

					if (buttons_header_type === 'image') {
						const buttons_header_image_url = this.getNodeParameter('buttons_header_image_url', i, '') as string;
						if (buttons_header_image_url && buttons_header_image_url.trim() && buttons_header_image_url.trim().startsWith('http')) {
							const validatedUrl = ValidateImageUrl(buttons_header_image_url);
							interactive.header = {
								type: 'image',
								image: { link: validatedUrl },
							};
						}
					} else if (buttons_header_type === 'text') {
						const buttons_header_text = this.getNodeParameter('buttons_header_text', i, '') as string;
						const trimmedText = buttons_header_text ? buttons_header_text.trim() : '';
						
						if (trimmedText && trimmedText.length > 0) {
							interactive.header = {
								type: 'text',
								text: trimmedText,
							};
						}
					}

					if (buttons_footer && buttons_footer.trim()) {
						interactive.footer = { text: buttons_footer.trim() };
					}

					main_message_body = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: recipient_phone,
						type: 'interactive',
						interactive,
					};

					main_message_text = `Buttons: ${buttons_body}`;

				} else if (message_type === 'list') {
					const list_body = this.getNodeParameter('list_body', i, '') as string;
					const list_button = this.getNodeParameter('list_button', i, '') as string;
					const list_header_type = this.getNodeParameter('list_header_type', i, 'none') as string;
					const list_footer = this.getNodeParameter('list_footer', i, '') as string;
					const options_raw = this.getNodeParameter('list_options_simple', i, '') as string;

					if (!list_body.trim() || !list_button.trim()) {
						throw new NodeOperationError(this.getNode(), 'Body y Button son requeridos');
					}

					const option_lines = options_raw.split('\n').filter(line => line.trim());
					
					if (option_lines.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Debes agregar al menos una opcion');
					}

					if (option_lines.length > 10) {
						throw new NodeOperationError(this.getNode(), `Maximo 10 opciones. Tienes ${option_lines.length}`);
					}

					const row_data = option_lines.map((line, index) => {
						const parts = line.split('|').map(p => p.trim());
						
						if (parts.length < 2) {
							throw new NodeOperationError(
								this.getNode(),
								`Linea ${index + 1}: Formato invalido. Usa: Title|id|description|close`,
							);
						}

						const row: Record<string, string> = {
							id: parts[1],
							title: parts[0],
						};

						if (parts[2] && parts[2] !== 'true' && parts[2] !== '1') {
							row.description = parts[2];
						}

						return row;
					});

					let list_image_url_for_separate_message = '';

					if (list_header_type === 'image') {
						const list_header_image_url = this.getNodeParameter('list_header_image_url', i, '') as string;
						if (list_header_image_url && list_header_image_url.trim() && list_header_image_url.trim().startsWith('http')) {
							list_image_url_for_separate_message = ValidateImageUrl(list_header_image_url);
						}
					}

					if (list_image_url_for_separate_message) {
						const imageMessageBody = {
							messaging_product: 'whatsapp',
							to: recipient_phone,
							type: 'image',
							image: { link: list_image_url_for_separate_message },
						};

						const imageResponse = await SendMessage(imageMessageBody);
						const image_messages = imageResponse.messages as Array<{id: string}> | undefined;
						sent_messages.push({
							message: 'Imagen de lista',
							messageId: image_messages?.[0]?.id || null,
							timestamp: new Date().toISOString(),
							type: 'list_image',
						});

						await sleep(300);
					}

					const interactive: Record<string, unknown> = {
						type: 'list',
						body: { text: list_body.trim() },
						action: {
							button: list_button.trim(),
							sections: [{ rows: row_data }],
						},
					};

					if (list_header_type === 'text') {
						const list_header_text = this.getNodeParameter('list_header_text', i, '') as string;
						const trimmedText = list_header_text ? list_header_text.trim() : '';
						
						if (trimmedText && trimmedText.length > 0) {
							interactive.header = {
								type: 'text',
								text: trimmedText,
							};
						}
					}

					if (list_footer && list_footer.trim()) {
						interactive.footer = { text: list_footer.trim() };
					}

					main_message_body = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: recipient_phone,
						type: 'interactive',
						interactive: interactive,
					};

					main_message_text = `Lista: ${list_body}`;

				} else if (message_type === 'cta') {
					const cta_body = this.getNodeParameter('cta_body', i, '') as string;
					const cta_header_type = this.getNodeParameter('cta_header_type', i, 'none') as string;
					const cta_footer = this.getNodeParameter('cta_footer', i, '') as string;
					const cta_buttons_raw = this.getNodeParameter('cta_buttons', i, '') as string;

					if (!cta_body.trim()) {
						throw new NodeOperationError(this.getNode(), 'Body es requerido');
					}

					const cta_button_lines = cta_buttons_raw.split('\n').filter(line => line.trim());
					
					if (cta_button_lines.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Debes agregar al menos un boton');
					}

					if (cta_button_lines.length > 1) {
						throw new NodeOperationError(this.getNode(), `Solo se soporta 1 boton CTA. Tienes ${cta_button_lines.length}`);
					}

					const parts = cta_button_lines[0].split('|').map(p => p.trim());
					
					if (parts.length < 3) {
						const ejemplo = 'Ver sitio|url|https://ejemplo.com';
						throw new NodeOperationError(
							this.getNode(),
							`Formato invalido. Debes incluir 3 partes separadas por |
Formato: Texto del boton|url|URL completa
Ejemplo: ${ejemplo}
Tu entrada tiene solo ${parts.length} parte(s)`,
						);
					}

					const button_type = parts[1].toLowerCase();
					
					if (button_type !== 'url') {
						throw new NodeOperationError(
							this.getNode(),
							`El segundo campo debe ser 'url', encontrado: '${parts[1]}'
Formato correcto: Texto del boton|url|https://ejemplo.com`,
						);
					}

					if (parts[0].length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'El texto del boton no puede estar vacio',
						);
					}

					if (parts[0].length > 20) {
						throw new NodeOperationError(
							this.getNode(),
							`El texto del boton no puede exceder 20 caracteres. Tiene ${parts[0].length}`,
						);
					}

					if (!parts[2] || parts[2].length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'La URL no puede estar vacia',
						);
					}

					if (!parts[2].startsWith('http')) {
						throw new NodeOperationError(
							this.getNode(),
							`La URL debe comenzar con http:// o https://
URL recibida: ${parts[2]}`,
						);
					}

					const interactive: Record<string, unknown> = {
						type: 'cta_url',
						body: { text: cta_body.trim() },
						action: {
							name: 'cta_url',
							parameters: {
								display_text: parts[0],
								url: parts[2],
							},
						},
					};

					if (cta_header_type === 'image') {
						const cta_header_image_url = this.getNodeParameter('cta_header_image_url', i, '') as string;
						if (cta_header_image_url && cta_header_image_url.trim() && cta_header_image_url.trim().startsWith('http')) {
							const validatedUrl = ValidateImageUrl(cta_header_image_url);
							interactive.header = {
								type: 'image',
								image: { link: validatedUrl },
							};
						}
					} else if (cta_header_type === 'text') {
						const cta_header_text = this.getNodeParameter('cta_header_text', i, '') as string;
						const trimmedText = cta_header_text ? cta_header_text.trim() : '';
						
						if (trimmedText && trimmedText.length > 0) {
							interactive.header = {
								type: 'text',
								text: trimmedText,
							};
						}
					}

					if (cta_footer && cta_footer.trim()) {
						interactive.footer = { text: cta_footer.trim() };
					}

					main_message_body = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: recipient_phone,
						type: 'interactive',
						interactive,
					};

					main_message_text = `CTA: ${cta_body}`;

				} else {
					const main_message = this.getNodeParameter('main_message', i, '') as string;
					const text_include_image = this.getNodeParameter('text_include_image', i, false) as boolean;

					if (text_include_image) {
						const text_image_url = this.getNodeParameter('text_image_url', i, '') as string;
						const text_image_caption = this.getNodeParameter('text_image_caption', i, '') as string;

						const validatedUrl = ValidateImageUrl(text_image_url);

						const imageObject: Record<string, string> = {
							link: validatedUrl,
						};

						const captionText = text_image_caption.trim() || main_message.trim();
						if (captionText) {
							imageObject.caption = captionText;
						}

						main_message_body = {
							messaging_product: 'whatsapp',
							to: recipient_phone,
							type: 'image',
							image: imageObject,
						};

						main_message_text = `Image: ${captionText}`;
					} else {
						if (!main_message.trim()) {
							throw new NodeOperationError(this.getNode(), 'El mensaje no puede estar vacio');
						}

						main_message_body = {
							messaging_product: 'whatsapp',
							to: recipient_phone,
							type: 'text',
							text: { body: main_message.trim() },
						};

						main_message_text = main_message.trim();
					}
				}

				const mainResponse = await SendMessage(main_message_body);
				const messages = mainResponse.messages as Array<{id: string}> | undefined;
				sent_messages.push({
					message: main_message_text,
					messageId: messages?.[0]?.id || null,
					timestamp: new Date().toISOString(),
					type: 'main',
				});

				if (send_presence_check) {
					const wait_time_check = this.getNodeParameter('wait_time_check', i, 30) as number;
					const message_interval = this.getNodeParameter('message_interval', i, 30) as number;
					const check_messages_raw = this.getNodeParameter('check_message', i, '') as string;
					const max_auto_messages = this.getNodeParameter('max_auto_messages', i, 5) as number;

					const check_messages = check_messages_raw
						.split('\n')
						.map(msg => msg.trim())
						.filter(msg => msg.length > 0);

					if (check_messages.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Los mensajes de espera no pueden estar vacios');
					}

					await sleep(wait_time_check * 1000);

					let messageIndex = 0;
					let messages_sent = 0;

					const firstMessage = check_messages[messageIndex % check_messages.length];
					messageIndex++;
					messages_sent++;

					const first_auto_body = {
						messaging_product: 'whatsapp',
						to: recipient_phone,
						type: 'text',
						text: { body: firstMessage },
					};

					const firstResponse = await SendMessage(first_auto_body);
					const first_messages = firstResponse.messages as Array<{id: string}> | undefined;
					sent_messages.push({
						message: firstMessage,
						messageId: first_messages?.[0]?.id || null,
						timestamp: new Date().toISOString(),
						type: 'presence_check',
					});

					void (async () => {
						while (messages_sent < max_auto_messages) {
							await sleep(message_interval * 1000);
							
							if (messages_sent >= max_auto_messages) {
								break;
							}

							const currentMessage = check_messages[messageIndex % check_messages.length];
							messageIndex++;
							messages_sent++;

							const auto_body = {
								messaging_product: 'whatsapp',
								to: recipient_phone,
								type: 'text',
								text: { body: currentMessage },
							};

							try {
								const response = await SendMessage(auto_body);
								const response_messages = response.messages as Array<{id: string}> | undefined;
								sent_messages.push({
									message: currentMessage,
									messageId: response_messages?.[0]?.id || null,
									timestamp: new Date().toISOString(),
									type: 'presence_check',
								});
							} catch {//error
							}
						}
					})();
				}

				continue_data.push({
					json: {
						success: true,
						recipient: recipient_phone,
						messageType: message_type,
						totalMessagesSent: sent_messages.length,
						presenceCheckSent: send_presence_check,
						messages: sent_messages,
						timestamp: new Date().toISOString(),
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					continue_data.push({
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

		return [continue_data, close_data];
	}
}