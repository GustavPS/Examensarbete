# OAuth
OAuth Identity Providern (IdP) och Service Providern (SP) är implementerade i javascript med hjälp av nodeJS och express.

## Starta projektet
1. Gå till mappen [IdP](https://github.com/GustavPS/Examensarbete/tree/master/OAuth/IdP) och kör kommandot `npm install`.
2. Gå till mappen [SP](https://github.com/GustavPS/Examensarbete/tree/master/OAuth/SP) och kör kommandot `npm install`.
3. I mappen IdP, kör kommandot `node index.js`.
4. Öppna en ny terminal i mappen SP och kör kommandot `node index.js`


## IdP
### Endpoints
#### *`/auth/authenticated`* **[POST]** [redirect_uri: String]

Denna endpointen kollar om användaren är inloggad mot IdP:n, detta görs genom en kontroll av sessionens `access_token`. Ifall användaren är inloggad mot IdP:n blir hen redirectad till`redirect_uri`. Ifall användaren inte är inloggad mot IdP:n blir hen redirectad till IdP:ns inloggningssida.

#### *`/auth/register`* **[POST]**

#### *`/auth/logout`* **[POST]**

Denna endpointen används för att logga ut en användare mot IdP:n. Den tar bort sesisonens `access_token` samt tar bort `access_token` från databasen.


#### *`/auth/login`* **[POST]** [username: String, password: String, redirect_uri: String]

Denna endpointen används för att logga in en användare. Ifall användaren angav fel lösenord/användarnamn redirectas hen tillbaka till inloggningssidan med korrekt felmedelande. Ifall användaren lyckades logga in så genereras en `access_token` och hen blir redirectad till `redirect_uri`.

## SP
### Endpoints
#### *`/`* **[GET]**
Denna endpointen visar startsidan där en användare kan välja att logga in.

#### *`/profile`* **[GET]**
Denna endpointen är en skyddad resurs som endast visas om man är inloggad mot IdP:n.

#### *`/callback`* **[POST]** [token: String, userid: String]
Denna endpointen validerar en access token mot IdP:n samt skapar en lokal session ifall IdP:n lyckas validera användaren.
