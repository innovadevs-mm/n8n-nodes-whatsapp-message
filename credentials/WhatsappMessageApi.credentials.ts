import {
	ICredentialType,
	INodeProperties,
	IAuthenticateGeneric,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class WhatsappMessageApi implements ICredentialType {
	name = 'whatsAppBusinessApi';
	displayName = 'WhatsApp Business API';
	documentationUrl = 'https://developers.facebook.com/docs/whatsapp';
	icon = {
		light: 'file:WhatsappMessage.svg',
		dark: 'file:WhatsappMessage.svg',
	} as const;

	properties: INodeProperties[] = [
		{
			displayName: 'WABA ID',
			name: 'wabaId',
			type: 'string',
			default: '',
			required: true,
			description: 'ID de tu cuenta WhatsApp Business',
		},
		{
			displayName: 'Phone Number ID',
			name: 'phoneNumberId',
			type: 'string',
			default: '',
			required: true,
			description: 'ID del número de teléfono de WhatsApp',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Token de acceso de tu aplicación de WhatsApp Business',
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
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			url: '/me',
			baseURL: 'https://graph.facebook.com/v22.0',
		},
	};
}

export default WhatsappMessageApi;