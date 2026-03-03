/**
 * UI utilities for setup command - colors, printing, prompts
 */

import { createInterface } from "node:readline";

// Clear screen
export function clearScreen(): void {
  // Clear screen and move cursor to top-left
  process.stdout.write("\x1b[2J\x1b[H");
}

// Colors (avoiding bold \x1b[1m which shows as red on some Windows terminals)
export const c = {
  reset: "\x1b[0m",
  bright: "\x1b[97m", // Bright white instead of bold
  dim: "\x1b[90m", // Gray
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export function printBanner(): void {
  console.error("");
  console.error(`${c.cyan}        ██  ██${c.reset}`);
  console.error(`${c.cyan}        ██  ██  ██    ██████ █████▄  ▄████▄${c.reset}`);
  console.error(`${c.cyan}        ██  ██  ██      ██   ██▄▄██▄ ██▄▄██${c.reset}`);
  console.error(`${c.cyan}        ██  ██  ██      ██   ██   ██ ██  ██${c.reset}`);
  console.error(`${c.cyan}        ██  ██  ██████  ██   ██   ██ ██  ██${c.reset}`);
  console.error(`${c.cyan}        ▀████▀          ▄████ ▄████▄ █████▄ █████${c.reset}`);
  console.error(`${c.cyan}                        ██    ██  ██ ██  ██ ██▄▄▄${c.reset}`);
  console.error(`${c.cyan}                        ▀████ ▀████▀ █████▀ ██▄▄▄${c.reset}`);
  console.error("");
  console.error(`${c.bright}     ╔═════════════════════════════════════════════════════╗${c.reset}`);
  console.error(`${c.bright}     ║              SEMANTIC EMBEDDING SETUP               ║${c.reset}`);
  console.error(`${c.bright}     ╚═════════════════════════════════════════════════════╝${c.reset}`);
  console.error("");
}

export function printOK(msg: string): void {
  console.error(`${c.green}[OK]${c.reset} ${msg}`);
}

export function printInfo(msg: string): void {
  console.error(`${c.cyan}[INFO]${c.reset} ${msg}`);
}

export function printWarn(msg: string): void {
  console.error(`${c.yellow}[WARN]${c.reset} ${msg}`);
}

export function printError(msg: string): void {
  console.error(`${c.red}[ERROR]${c.reset} ${msg}`);
}

export async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function printCompleteBanner(): void {
  console.error("");
  console.error(`${c.green}${c.bright}╔═══════════════════════════════════════════════════════════════╗${c.reset}`);
  console.error(`${c.green}${c.bright}║                     Setup Complete!                           ║${c.reset}`);
  console.error(`${c.green}${c.bright}╚═══════════════════════════════════════════════════════════════╝${c.reset}`);
  console.error("");
}
