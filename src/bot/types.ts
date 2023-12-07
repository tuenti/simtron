import { Command } from "../device-port/model/command";
import { OutgoingMessage } from "./model/message";

export type SendMessageCallback = (message: OutgoingMessage) => void;
export type SendCommandCallback = (command: Command, portId: string) => Promise<{[key: string]: any}>;
