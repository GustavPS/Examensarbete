# SAML
SAML Service Providern (SP) är implementerad i javascript med hjälp av nodeJS och express.

## Starta projektet
1. Kör `npm install`
2. Kör `node app.js`

### Endpoints
#### *`/`* **[GET]**
Denna endpointen visar startsidan för användaren.

#### *`/consume`* **[POST]** [SAMLResponse: String, RelayState: String]
Denna endpointen tolkar SAML IdP:ns respons, genererar en lokal access token för användaren samt redirectar till `RelayState`.
Detta är ingen endpoint som användaren manuellt går till, det är hit SAML IdP:n skickar tillbaka responsen efter ett inloggningsförsök.

#### *`/logout`* **[POST]**
Denna endpointen används för att logga ut en användare mot IdP:n. Den tar bort sesisonens `access_token` samt redirectar till IdP:ns logout endpoint.

#### *`/profile`* **[GET]**
Denna endpointen visar användarens profilsida om hen är inloggad annars startas SAML autentieringen.
