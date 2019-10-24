import express from "express";
import https from "https";
import bodyParser from "body-parser";
import helmet from "helmet";
import tls from "tls";
import fs from "fs";
import path from "path";
import cors from "cors";
import { IpDeniedError } from "express-ipfilter";
import adalNode from "adal-node";
import DynamicsWebApi from "dynamics-web-api";

//Configuration
const crmUrl = "https://myorg.crm.dynamics.com",
  apiPath = "/api/data/v9.1/",
  clientId = "00000000-0000-0000-0000-000000000001",
  userName = "crm-user-name",
  password = "crm-user-password",
  port = 3000;

const accessTokenUrl = "https://login.microsoftonline.com/common/oauth2/token",
  webApiUrl = `${crmUrl}${apiPath}`,
  sslDirectory = path.join(__dirname, "ssl");

function Error401(message) {
  this.code = 401;
  this.message = message;
}

function get365(next) {
  return new DynamicsWebApi({
    webApiUrl,
    onTokenRefresh: callback => {
      let context = new adalNode.AuthenticationContext(accessTokenUrl);

      context.acquireTokenWithUsernamePassword(
        crmUrl,
        userName,
        password,
        clientId,
        (err, tokenResponse) => {
          if (!!err) {
            next(err);
          } else {
            callback(tokenResponse);
          }
        }
      );
    }
  });
}

const router = express.Router(),
  app = express();

router.use(cors());

router.get("/test", async (req, res, next) => {
  try {
    const cnn365 = get365(next),
      response = await cnn365.executeUnboundFunction("WhoAmI");

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

router.post(`${apiPath}*`, async (req, res, next) => {
  try {
    const cnn365 = get365(next),
      action = req.originalUrl.replace(apiPath, ""),
      response = await cnn365.executeUnboundAction(action, req.body);

    res.send(response);
  } catch (e) {
    try {
      const err = JSON.parse(e);
      res.status(err.status).send(e);
    } catch (e2) {
      res.status(400).send(e);
    }
  }
});

router.use(function(req, res) {
  res.sendStatus(404);
});

router.use(function(err, req, res, next) {
  if (err instanceof IpDeniedError) {
    res.sendStatus(401);
  } else if (err instanceof Error401) {
    res.sendStatus(401);
  } else {
    res.sendStatus(500);
  }
});

app.set("port", port);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use(helmet());
app.use("/", router);

https
  .createServer(
    {
      key: fs.readFileSync(path.join(sslDirectory, "server.key")),
      cert: fs.readFileSync(path.join(sslDirectory, "server.crt")),
      ciphers: "AES128-GCM-SHA256:HIGH:!MD5:!aNULL:!EDH",
      honorCipherOrder: true,
      minVersion: tls.DEFAULT_MIN_VERSION,
      maxVersion: tls.DEFAULT_MAX_VERSION
    },
    app
  )
  .listen(app.get("port"));
