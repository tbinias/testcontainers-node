import { Duration } from "node-duration";
import { EnvKey, EnvValue } from "./docker-client";
import { Port } from "./port";
import { Image, Tag } from "./repo-tag";
import { StartedTestContainer, TestContainer } from "./test-container";
export declare class GenericContainer implements TestContainer {
    readonly image: Image;
    readonly tag: Tag;
    private readonly repoTag;
    private readonly dockerClient;
    private env;
    private ports;
    private startupTimeout;
    constructor(image: Image, tag?: Tag);
    start(): Promise<StartedTestContainer>;
    withEnv(key: EnvKey, value: EnvValue): TestContainer;
    withExposedPorts(...ports: Port[]): TestContainer;
    withStartupTimeout(startupTimeout: Duration): TestContainer;
    private hasRepoTagLocally;
    private waitForContainer;
}
