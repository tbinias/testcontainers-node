import Dockerode from "dockerode";
import { BoundPorts } from "./bound-ports";
import { Container } from "./container";
import { RepoTag } from "./repo-tag";
export declare type Command = string;
export declare type ExitCode = number;
export declare type EnvKey = string;
export declare type EnvValue = string;
export declare type Env = {
    [key in EnvKey]: EnvValue;
};
declare type StreamOutput = string;
declare type ExecResult = {
    output: StreamOutput;
    exitCode: ExitCode;
};
export interface DockerClient {
    pull(repoTag: RepoTag): Promise<void>;
    create(repoTag: RepoTag, env: Env, boundPorts: BoundPorts): Promise<Container>;
    start(container: Container): Promise<void>;
    exec(container: Container, command: Command[]): Promise<ExecResult>;
    fetchRepoTags(): Promise<RepoTag[]>;
}
export declare class DockerodeClient implements DockerClient {
    private readonly dockerode;
    constructor(dockerode?: Dockerode);
    pull(repoTag: RepoTag): Promise<void>;
    create(repoTag: RepoTag, env: Env, boundPorts: BoundPorts): Promise<Container>;
    start(container: Container): Promise<void>;
    exec(container: Container, command: Command[]): Promise<ExecResult>;
    fetchRepoTags(): Promise<RepoTag[]>;
    private isDanglingImage;
    private getEnv;
    private getExposedPorts;
    private getPortBindings;
}
export {};
