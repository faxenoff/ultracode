/**
 * OVMS gRPC Client
 *
 * High-performance gRPC client for OpenVINO Model Server.
 * Uses KServe V2 Inference Protocol for binary communication.
 *
 * Advantages over REST:
 * - Binary protobuf serialization (30-50% smaller payload)
 * - HTTP/2 multiplexing (parallel requests in one connection)
 * - Persistent connection (no TCP handshake per request)
 * - Lower latency for batch inference
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Proto file path
const PROTO_PATH = join(__dirname, "proto", "grpc_predict_v2.proto");

// Proto loader options
const PROTO_OPTIONS: protoLoader.Options = {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
};

// Type definitions for gRPC service
interface InferTensorContents {
  bool_contents?: boolean[];
  int_contents?: number[];
  int64_contents?: number[];
  uint_contents?: number[];
  uint64_contents?: number[];
  fp32_contents?: number[];
  fp64_contents?: number[];
  bytes_contents?: Buffer[];
}

interface InferInputTensor {
  name: string;
  datatype: string;
  shape: number[];
  contents?: InferTensorContents;
}

interface InferOutputTensor {
  name: string;
  datatype: string;
  shape: number[];
  contents?: InferTensorContents;
}

interface ModelInferRequest {
  model_name: string;
  model_version?: string;
  id?: string | undefined;
  inputs: InferInputTensor[];
  outputs?: { name: string }[];
  raw_input_contents?: Buffer[];
}

interface ModelInferResponse {
  model_name: string;
  model_version: string;
  id: string;
  outputs: InferOutputTensor[];
  raw_output_contents?: Buffer[];
}

interface ServerReadyResponse {
  ready: boolean;
}

interface ModelMetadataResponse {
  name: string;
  versions: string[];
  platform: string;
  inputs: { name: string; datatype: string; shape: number[] }[];
  outputs: { name: string; datatype: string; shape: number[] }[];
}

// gRPC service client type
interface GRPCInferenceService {
  ServerReady: (
    request: Record<string, never>,
    callback: (error: grpc.ServiceError | null, response: ServerReadyResponse) => void,
  ) => void;
  ModelMetadata: (
    request: { name: string; version?: string },
    callback: (error: grpc.ServiceError | null, response: ModelMetadataResponse) => void,
  ) => void;
  ModelInfer: (
    request: ModelInferRequest,
    options: { deadline: Date },
    callback: (error: grpc.ServiceError | null, response: ModelInferResponse) => void,
  ) => void;
  getChannel: () => grpc.Channel;
  close: () => void;
}

// Proto package structure
interface GrpcProtoPackage {
  inference: {
    GRPCInferenceService: new (
      address: string,
      credentials: grpc.ChannelCredentials,
      options?: grpc.ChannelOptions,
    ) => unknown;
  };
}

export interface OVMSGrpcClientOptions {
  host: string;
  port: number;
  modelName: string;
  timeoutMs?: number | undefined;
  maxMessageSize?: number | undefined;
}

export class OVMSGrpcClient {
  private client: GRPCInferenceService | null = null;
  private options: OVMSGrpcClientOptions;
  private grpcObject: GrpcProtoPackage | null = null;

  constructor(options: OVMSGrpcClientOptions) {
    this.options = {
      timeoutMs: 120_000,
      maxMessageSize: 100 * 1024 * 1024, // 100MB
      ...options,
    };
  }

  /**
   * Initialize the gRPC client
   */
  async initialize(): Promise<void> {
    // Load proto file
    const packageDefinition = await protoLoader.load(PROTO_PATH, PROTO_OPTIONS);
    this.grpcObject = grpc.loadPackageDefinition(packageDefinition) as unknown as GrpcProtoPackage;

    const address = `${this.options.host}:${this.options.port}`;

    // Create channel with options
    const channelOptions: grpc.ChannelOptions = {
      "grpc.max_send_message_length": this.options.maxMessageSize!,
      "grpc.max_receive_message_length": this.options.maxMessageSize!,
      "grpc.keepalive_time_ms": 30000,
      "grpc.keepalive_timeout_ms": 10000,
      "grpc.keepalive_permit_without_calls": 1,
      "grpc.http2.min_time_between_pings_ms": 10000,
      "grpc.http2.max_pings_without_data": 0,
    };

    // Create client
    const InferenceService = this.grpcObject.inference.GRPCInferenceService;
    this.client = new InferenceService(
      address,
      grpc.credentials.createInsecure(),
      channelOptions,
    ) as unknown as GRPCInferenceService;

    // Wait for connection
    await this.waitForReady();
  }

  /**
   * Wait for gRPC channel to be ready
   */
  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000; // 10 sec timeout
      const channel = this.client!.getChannel();

      channel.watchConnectivityState(channel.getConnectivityState(true), new Date(deadline), (error?: Error) => {
        if (error) {
          reject(new Error(`gRPC connection failed: ${error.message}`));
        } else {
          const state = channel.getConnectivityState(false);
          if (state === grpc.connectivityState.READY) {
            resolve();
          } else {
            // Retry watching
            this.waitForReady().then(resolve).catch(reject);
          }
        }
      });
    });
  }

  /**
   * Check if server is ready
   */
  async isServerReady(): Promise<boolean> {
    if (!this.client) throw new Error("Client not initialized");

    return new Promise((resolve, reject) => {
      this.client!.ServerReady({}, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.ready);
        }
      });
    });
  }

  /**
   * Get model metadata
   */
  async getModelMetadata(): Promise<ModelMetadataResponse> {
    if (!this.client) throw new Error("Client not initialized");

    return new Promise((resolve, reject) => {
      this.client!.ModelMetadata({ name: this.options.modelName }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Run inference with tokenized input
   * @param inputIds - Token IDs [batch_size, seq_len]
   * @param attentionMask - Attention mask [batch_size, seq_len]
   * @param tokenTypeIds - Token type IDs [batch_size, seq_len] (optional)
   * @returns Embeddings [batch_size, hidden_size] or [batch_size, seq_len, hidden_size]
   */
  async infer(inputIds: number[][], attentionMask: number[][], tokenTypeIds?: number[][]): Promise<Float32Array[]> {
    if (!this.client) throw new Error("Client not initialized");

    const batchSize = inputIds.length;
    const seqLen = inputIds[0]?.length || 0;

    // Flatten 2D arrays to 1D for gRPC
    const flatInputIds = inputIds.flat();
    const flatAttentionMask = attentionMask.flat();

    // Build input tensors
    const inputs: InferInputTensor[] = [
      {
        name: "input_ids",
        datatype: "INT64",
        shape: [batchSize, seqLen],
        contents: { int64_contents: flatInputIds },
      },
      {
        name: "attention_mask",
        datatype: "INT64",
        shape: [batchSize, seqLen],
        contents: { int64_contents: flatAttentionMask },
      },
    ];

    // Add token_type_ids if provided
    if (tokenTypeIds) {
      const flatTokenTypeIds = tokenTypeIds.flat();
      inputs.push({
        name: "token_type_ids",
        datatype: "INT64",
        shape: [batchSize, seqLen],
        contents: { int64_contents: flatTokenTypeIds },
      });
    }

    const request: ModelInferRequest = {
      model_name: this.options.modelName,
      inputs,
      outputs: [{ name: "last_hidden_state" }],
    };

    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + this.options.timeoutMs!);

      // Set deadline on the call
      const callOptions = {
        deadline,
      };

      // Make the gRPC call with deadline
      this.client!.ModelInfer(request, callOptions, (error: grpc.ServiceError | null, response: ModelInferResponse) => {
        if (error) {
          reject(new Error(`gRPC inference failed: ${error.message} (code: ${error.code})`));
          return;
        }

        try {
          const embeddings = this.parseInferenceOutput(response, batchSize, seqLen, attentionMask);
          resolve(embeddings);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  /**
   * Parse inference output and apply mean pooling if needed
   */
  private parseInferenceOutput(
    response: ModelInferResponse,
    batchSize: number,
    seqLen: number,
    attentionMask: number[][],
  ): Float32Array[] {
    const output = response.outputs[0];
    if (!output) {
      throw new Error("No output tensor in response");
    }

    const shape = output.shape;
    let rawData: number[];

    // Get raw data from contents or raw_output_contents
    if (output.contents?.fp32_contents && output.contents.fp32_contents.length > 0) {
      rawData = output.contents.fp32_contents;
    } else if (response.raw_output_contents && response.raw_output_contents.length > 0) {
      // Parse raw binary data as float32
      const buffer = response.raw_output_contents[0];
      if (!buffer) {
        throw new Error("Raw output buffer is undefined");
      }
      rawData = Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
    } else {
      throw new Error("No embedding data in response");
    }

    // Determine output shape
    if (shape.length === 2) {
      // Already pooled: [batch_size, hidden_size]
      const hiddenSize = shape[1]!;
      const embeddings: Float32Array[] = [];

      for (let i = 0; i < batchSize; i++) {
        const start = i * hiddenSize;
        embeddings.push(new Float32Array(rawData.slice(start, start + hiddenSize)));
      }

      return embeddings;
    } else if (shape.length === 3) {
      // Needs mean pooling: [batch_size, seq_len, hidden_size]
      const hiddenSize = shape[2]!;
      return this.meanPooling(rawData, batchSize, seqLen, hiddenSize, attentionMask);
    } else {
      throw new Error(`Unexpected output shape: [${shape.join(", ")}]`);
    }
  }

  /**
   * Apply mean pooling over token embeddings
   */
  private meanPooling(
    rawData: number[],
    batchSize: number,
    seqLen: number,
    hiddenSize: number,
    attentionMask: number[][],
  ): Float32Array[] {
    const embeddings: Float32Array[] = [];

    for (let b = 0; b < batchSize; b++) {
      const pooled = new Float32Array(hiddenSize);
      let validTokens = 0;
      const maskRow = attentionMask[b];
      if (!maskRow) continue;

      for (let s = 0; s < seqLen; s++) {
        const mask = maskRow[s];
        if (mask === 0 || mask === undefined) continue;

        validTokens++;
        const offset = (b * seqLen + s) * hiddenSize;

        for (let h = 0; h < hiddenSize; h++) {
          pooled[h]! += rawData[offset + h] ?? 0;
        }
      }

      // Divide by valid token count
      if (validTokens > 0) {
        for (let h = 0; h < hiddenSize; h++) {
          pooled[h]! /= validTokens;
        }
      }

      // L2 normalize
      let norm = 0;
      for (let h = 0; h < hiddenSize; h++) {
        const val = pooled[h]!;
        norm += val * val;
      }
      norm = Math.sqrt(norm);
      if (norm > 0) {
        for (let h = 0; h < hiddenSize; h++) {
          pooled[h]! /= norm;
        }
      }

      embeddings.push(pooled);
    }

    return embeddings;
  }

  /**
   * Close the gRPC client
   */
  close(): void {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
  }
}
