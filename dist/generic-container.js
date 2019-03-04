"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const node_duration_1 = require("node-duration");
const container_state_1 = require("./container-state");
const docker_client_1 = require("./docker-client");
const port_binder_1 = require("./port-binder");
const port_check_1 = require("./port-check");
const repo_tag_1 = require("./repo-tag");
const wait_strategy_1 = require("./wait-strategy");
class GenericContainer {
    constructor(image, tag = "latest") {
        this.image = image;
        this.tag = tag;
        this.dockerClient = new docker_client_1.DockerodeClient();
        this.env = {};
        this.ports = [];
        this.startupTimeout = new node_duration_1.Duration(10000, node_duration_1.TemporalUnit.MILLISECONDS);
        this.repoTag = new repo_tag_1.RepoTag(image, tag);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.hasRepoTagLocally())) {
                yield this.dockerClient.pull(this.repoTag);
            }
            const boundPorts = yield new port_binder_1.PortBinder().bind(this.ports);
            const container = yield this.dockerClient.create(this.repoTag, this.env, boundPorts);
            yield this.dockerClient.start(container);
            const inspectResult = yield container.inspect();
            const containerState = new container_state_1.ContainerState(inspectResult);
            const runningInDocker = child_process_1.execSync("cat /proc/1/cgroup | grep docker | wc -l")
                .toString()
                .trim() !== "0";
            const containerIp = runningInDocker
                ? child_process_1.execSync("ip -4 route list match 0/0 | awk '{print $3}'")
                    .toString("UTF-8")
                    .trim()
                : "127.0.0.1";
            yield this.waitForContainer(container, containerState, containerIp);
            return new StartedGenericContainer(container, boundPorts);
        });
    }
    withEnv(key, value) {
        this.env[key] = value;
        return this;
    }
    withExposedPorts(...ports) {
        this.ports = ports;
        return this;
    }
    withStartupTimeout(startupTimeout) {
        this.startupTimeout = startupTimeout;
        return this;
    }
    hasRepoTagLocally() {
        return __awaiter(this, void 0, void 0, function* () {
            const repoTags = yield this.dockerClient.fetchRepoTags();
            return repoTags.some(repoTag => repoTag.equals(this.repoTag));
        });
    }
    waitForContainer(container, containerState, containerIp) {
        return __awaiter(this, void 0, void 0, function* () {
            const hostPortCheck = new port_check_1.HostPortCheck(containerIp);
            const internalPortCheck = new port_check_1.InternalPortCheck(container, this.dockerClient);
            const waitStrategy = new wait_strategy_1.HostPortWaitStrategy(this.dockerClient, hostPortCheck, internalPortCheck);
            yield waitStrategy.withStartupTimeout(this.startupTimeout).waitUntilReady(containerState);
        });
    }
}
exports.GenericContainer = GenericContainer;
class StartedGenericContainer {
    constructor(container, boundPorts) {
        this.container = container;
        this.boundPorts = boundPorts;
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.container.stop();
            yield this.container.remove();
            return new StoppedGenericContainer();
        });
    }
    getMappedPort(port) {
        return this.boundPorts.getBinding(port);
    }
    getContainerIpAddress() {
        const runningInDocker = child_process_1.execSync("cat /proc/1/cgroup | grep docker | wc -l")
            .toString()
            .trim() !== "0";
        const containerIp = runningInDocker
            ? child_process_1.execSync("ip -4 route list match 0/0 | awk '{print $3}'")
                .toString("UTF-8")
                .trim()
            : "127.0.0.1";
        return containerIp;
    }
}
class StoppedGenericContainer {
}
