import "tslib";

const globalVar =
  typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : Function("return this;")();

if (!globalVar.setTimeout || !globalVar.clearTimeout) {
  const timers = require("timers");
  globalVar.clearTimeout = timers.clearTimeout;
  globalVar.setTimeout = timers.setTimeout;
}

export * from "./node";
