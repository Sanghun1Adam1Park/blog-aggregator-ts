import fs from "fs";
import os from "os";
import path from "path";

const filePath = path.join(os.homedir(), ".gatorconfig.json");

type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(userName: string) {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}

function validateConfig(rawConfig: any) {
  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("db_url is required in config file");
  }
  if (
    !rawConfig.current_user_name ||
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("current_user_name is required in config file");
  }

  const config: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };

  return config;
}

export function readConfig() {
  const data = fs.readFileSync(filePath, "utf-8");
  const rawConfig = JSON.parse(data);

  return validateConfig(rawConfig);
}

function writeConfig(config: Config) {
  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };

  const data = JSON.stringify(rawConfig, null, 2);
  fs.writeFileSync(filePath, data, { encoding: "utf-8" });
}