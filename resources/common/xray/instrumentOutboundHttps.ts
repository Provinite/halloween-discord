import { captureHTTPsGlobal } from "aws-xray-sdk";
import https = require("https");
captureHTTPsGlobal(https, false);
