const stringGenerator = require('crypto-random-string');
const zlib = require('zlib');

module.exports = class SAML {
    constructor() {
        this.IDLength = 32;
        this.issuer = 'http://localsp';
    }
    
    generateID() {
        return stringGenerator({length: this.IDLength});
    }

    getIssueInstant() {
        let date = new Date();
        return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth()+1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2) + 'T' + ('0' + (date.getUTCHours()+2)).slice(-2) + ":" + ('0' + date.getUTCMinutes()).slice(-2) + ":" + ('0' + date.getUTCSeconds()).slice(-2) + "Z";
    }

    getSAMLRequest(id, req) {
        var issue_instant = this.getIssueInstant();
        var const_assertion_consumer_service_url = 'http://' + req.headers.host + '/saml/consume';  // Post auth destination

        var const_name_identifier_format = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress";
        var request =
                    "<samlp:AuthnRequest xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" ID=\"" + id + "\" Version=\"2.0\" IssueInstant=\"" + issue_instant + "\" ProtocolBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\" AssertionConsumerServiceURL=\"" + const_assertion_consumer_service_url + "\">" +
                    "<saml:Issuer xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\">" + this.issuer + "</saml:Issuer>\n" +
                    "<samlp:NameIDPolicy xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" Format=\"" + const_name_identifier_format + "\" AllowCreate=\"true\"></samlp:NameIDPolicy>\n" +
                    "<samlp:RequestedAuthnContext xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" Comparison=\"exact\">" +
                    "<saml:AuthnContextClassRef xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\">urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></samlp:RequestedAuthnContext>\n" +
                    "</samlp:AuthnRequest>";
        return request;
    }

    encode(request, cb) {
        zlib.deflateRaw(request, cb);
    }

    startAuth(req, res) {
        let id = "_" + this.generateID();
        let request = this.getSAMLRequest(id, req);
        this.encode(request, (err, buffer) => {
            if (err) {
                console.log("Error: " + err);
                return;
            }
            let compressed_request = buffer;
            let base64 = compressed_request.toString('base64');
            let encoded = encodeURIComponent(base64);
            res.redirect('http://193.14.194.203/simplesaml/saml2/idp/SSOService.php?SAMLRequest=' + encoded + '&RelayState=' + req.originalUrl);

            // Hämta API nyckeln för this.issuer i en databas (Det är nog en URL?)
            // Lägg till ?SAMLRequest=encoded
            // Redirecta till den url:en.
        });

    }
}
