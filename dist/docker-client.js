"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dockerode_1 = __importDefault(require("dockerode"));
const stream_to_array_1 = __importDefault(require("stream-to-array"));
const container_1 = require("./container");
const logger_1 = __importDefault(require("./logger"));
const repo_tag_1 = require("./repo-tag");
class DockerodeClient {
    constructor(dockerode = new dockerode_1.default()) {
        this.dockerode = dockerode;
    }
    pull(repoTag) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Pulling image: ${repoTag}`);
            const stream = yield this.dockerode.pull(repoTag.toString(), {});
            yield stream_to_array_1.default(stream);
        });
    }
    create(repoTag, env, boundPorts) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Creating container for image: ${repoTag}`);
            const dockerodeContainer = yield this.dockerode.createContainer({
                Image: repoTag.toString(),
                Env: this.getEnv(env),
                ExposedPorts: this.getExposedPorts(boundPorts),
                HostConfig: {
                    PortBindings: this.getPortBindings(boundPorts)
                }
            });
            return new container_1.DockerodeContainer(dockerodeContainer);
        });
    }
    start(container) {
        logger_1.default.info(`Starting container with ID: ${container.getId()}`);
        return container.start();
    }
    exec(container, command) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Executing command "${command.join(" ")}" on container with ID: ${container.getId()}`);
            const exec = yield container.exec({
                cmd: command,
                attachStdout: true,
                attachStderr: true
            });
            const stream = yield exec.start();
            const output = Buffer.concat(yield stream_to_array_1.default(stream)).toString();
            const { exitCode } = yield exec.inspect();
            return { output, exitCode };
        });
    }
    fetchRepoTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const images = yield this.dockerode.listImages();
            return images.reduce((repoTags, image) => {
                if (this.isDanglingImage(image)) {
                    return repoTags;
                }
                const imageRepoTags = image.RepoTags.map(imageRepoTag => {
                    const [imageName, tag] = imageRepoTag.split(":");
                    return new repo_tag_1.RepoTag(imageName, tag);
                });
                return [...repoTags, ...imageRepoTags];
            }, []);
        });
    }
    isDanglingImage(image) {
        return image.RepoTags === null;
    }
    getEnv(env) {
        return Object.entries(env).reduce((dockerodeEnvironment, [key, value]) => {
            return [...dockerodeEnvironment, `${key}=${value}`];
        }, []);
    }
    getExposedPorts(boundPorts) {
        const dockerodeExposedPorts = {};
        for (const [internalPort] of boundPorts.iterator()) {
            dockerodeExposedPorts[internalPort.toString()] = {};
        }
        return dockerodeExposedPorts;
    }
    getPortBindings(boundPorts) {
        const dockerodePortBindings = {};
        for (const [internalPort, hostPort] of boundPorts.iterator()) {
            dockerodePortBindings[internalPort.toString()] = [{ HostPort: hostPort.toString() }];
        }
        return dockerodePortBindings;
    }
}
exports.DockerodeClient = DockerodeClient;
