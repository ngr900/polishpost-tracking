const soap = require('soap');
const PolishPostClient = require('./client.js');

const WSDL_URL =
	'https://tt.poczta-polska.pl/Sledzenie/services/Sledzenie?wsdl';


function connect(options) {
	return new Promise(function (resolve, reject) {
		if ( !options.username || !options.password ) {
			return reject(new Error('Username and password are required'));
		}
		const security = new soap.WSSecurity(options.username, options.password, {
			hasTimeStamp: false,
			hasTokenCreated: false,
		});
		soap.createClient(WSDL_URL, function (err, soapClient) {
			if (err) return reject(err);
			soapClient.setSecurity(security);
			const client = new PolishPostClient(soapClient);
			if ( options.language ) client.setLanguage(options.language)
			resolve ( client)
		});
	}).then ( client => options.doNotTestConnection ? Promise.resolve(client) : client.testConnection());
}

module.exports = {
	connect,
};
