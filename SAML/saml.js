const stringGenerator = require('crypto-random-string');
const zlib = require('zlib');

module.exports = class SAML {
    constructor() {
        this.IDLength = 32;
        this.issuer = 'http://localsp';
    }
    
    /**
     *  Generates an ID
     */
    generateID() {
        return stringGenerator({length: this.IDLength});
    }

    /**
     * Return the current date in SAML issueInstant format
     */
    getIssueInstant() {
        let date = new Date();
        return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth()+1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2) + 'T' + ('0' + (date.getUTCHours()+2)).slice(-2) + ":" + ('0' + date.getUTCMinutes()).slice(-2) + ":" + ('0' + date.getUTCSeconds()).slice(-2) + "Z";
    }

    /**
     * 
     * Generates a SAML request
     * 
     * @param {string} id 
     * @param {object} req 
     */
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

    /**
     * Encodes the requst string
     * 
     * @param {string} request 
     * @param {function} cb - Callback function
     */
    encode(request, cb) {
        zlib.deflateRaw(request, cb);
    }

    /**
     * Start the SAML authentication, generate the request and redirect the user to the IdP
     * 
     * @param {object} req 
     * @param {object} res 
     */
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
        });
    }

    /**
     * Remove the users accessToken and redirect him/her to the IdP logout endpoint
     *  
     * @param {object} req 
     * @param {object} res 
     */
    logout(req, res) {
        req.session.accessToken = undefined;
        req.session.username = undefined;
        res.redirect('http://193.14.194.203/simplesaml/saml2/idp/SingleLogoutService.php?ReturnTo=http://localhost:3000');
    }
}
