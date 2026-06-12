import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: client.Registry;

  // HTTP metrics
  readonly httpRequestDuration: client.Histogram<string>;
  readonly httpRequestTotal: client.Counter<string>;
  readonly httpRequestErrors: client.Counter<string>;

  // Business metrics (thêm tùy app của bạn)
  readonly activeConnections: client.Gauge<string>;

  constructor() {
    this.registry = new client.Registry();

    // Label mặc định — gắn app name vào mọi metric
    this.registry.setDefaultLabels({ app: 'e-commerce' });

    // Thu thập default metrics: CPU, RAM, heap, event loop lag, GC
    client.collectDefaultMetrics({
      register: this.registry,
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });

    // Histogram đo latency từng request (quan trọng nhất)
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });

    // Counter tổng số request
    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Counter lỗi (4xx, 5xx)
    this.httpRequestErrors = new client.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Gauge — ví dụ WebSocket/connections đang active
    this.activeConnections = new client.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Không cần làm gì thêm, prom-client tự chạy
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
