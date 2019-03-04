import { Container } from "./container";
import { DockerClient } from "./docker-client";
import { Port } from "./port";
export interface PortCheck {
    isBound(port: Port): Promise<boolean>;
}
export declare class HostPortCheck implements PortCheck {
    private containerIp;
    constructor(containerIp: string);
    isBound(port: Port): Promise<boolean>;
}
export declare class InternalPortCheck implements PortCheck {
    private readonly container;
    private readonly dockerClient;
    constructor(container: Container, dockerClient: DockerClient);
    isBound(port: Port): Promise<boolean>;
}
