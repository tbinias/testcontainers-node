declare type Message = string;
export interface Logger {
    debug(message: Message): void;
    info(message: Message): void;
    warn(message: Message): void;
    error(message: Message): void;
}
declare class DebugLogger implements Logger {
    private readonly logger;
    constructor();
    debug(message: Message): void;
    info(message: Message): void;
    warn(message: Message): void;
    error(message: Message): void;
}
declare const _default: DebugLogger;
export default _default;
