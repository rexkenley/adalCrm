import express from "express";
import adal from "adal-node";
import DynamicsWebApi from "dynamics-web-api";

const authorityUrl =
    "https://login.microsoftonline.com/00000000-0000-0000-0000-000000000011/oauth2/token",
  crmUrl = "https://myorg.crm.dynamics.com",
  webApiUrl = "https://myorg.api.crm.dynamics.com/api/data/v9.0/",
  clientId = "00000000-0000-0000-0000-000000000001",
  username = "crm-user-name",
  password = "crm-user-password";

const authentication = new adal.AuthenticationContext(authorityUrl),
  dynamicsWebApi = new DynamicsWebApi({
    webApiUrl,
    onTokenRefresh: dynamicsWebApiCallback => {
      authentication.acquireTokenWithUsernamePassword(
        crmUrl,
        username,
        password,
        clientId,
        (error, token) => {
          !error
            ? dynamicsWebApiCallback(token)
            : console.warn(
                `Token has not been retrieved. Error: ${error.stack}`
              );
        }
      );
    }
  }),
  app = express(),
  port = 3000;

app.get("", async () => await dynamicsWebApi.executeUnboundFunction(""));
app.listen(port);
