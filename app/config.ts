import toml from "toml";
import fs from "fs";

const configToml = fs.readFileSync("./shopify.app.toml", "utf-8");
const config = toml.parse(configToml);

export default {
  APP_URL: config.application_url,  // adapt to your TOML structure
  APP_HANDLE:config.handle
};
