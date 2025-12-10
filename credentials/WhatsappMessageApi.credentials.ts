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
