import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import * as os from 'os';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: client.Registry;

  // HTTP metrics
  readonly httpRequestDuration: client.Histogram<string>;
  readonly httpRequestTotal: client.Counter<string>;
  readonly httpRequestErrors: client.Counter<string>;

  // Business metrics
  readonly activeConnections: client.Gauge<string>;

  // --- THÊM CÁC METRICS PHẦN CỨNG ---
  private readonly systemMemoryTotal: client.Gauge<string>;
  private readonly systemMemoryFree: client.Gauge<string>;
  private readonly systemMemoryUsagePercent: client.Gauge<string>;
  private readonly systemCpuUsagePercent: client.Gauge<string>;
  private lastCpuInfo: { idle: number; total: number };

  //
  constructor() {
    this.registry = new client.Registry();

    // Label mặc định — gắn app name vào mọi metric
    this.registry.setDefaultLabels({ app: 'e-commerce' });

    // Thu thập default metrics: CPU, RAM, heap, event loop lag, GC (riêng process)
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

    // --- KHỞI TẠO GAUGES CHO PHẦN CỨNG SERVER ---
    this.systemMemoryTotal = new client.Gauge({
      name: 'node_hardware_memory_total_bytes',
      help: 'Total system memory in bytes',
      registers: [this.registry],
    });

    this.systemMemoryFree = new client.Gauge({
      name: 'node_hardware_memory_free_bytes',
      help: 'Free system memory in bytes',
      registers: [this.registry],
    });

    this.systemMemoryUsagePercent = new client.Gauge({
      name: 'node_hardware_memory_usage_percent',
      help: 'System memory usage percentage',
      registers: [this.registry],
    });

    this.systemCpuUsagePercent = new client.Gauge({
      name: 'node_hardware_cpu_usage_percent',
      help: 'System CPU usage percentage across all cores',
      registers: [this.registry],
    });

    // Khởi tạo điểm mốc tính CPU ban đầu
    this.lastCpuInfo = this.getAbsoluteCpuTime();
  }

  onModuleInit() {
    // Không cần làm gì thêm, prom-client tự chạy
  }

  // Hàm cập nhật động các thông số phần cứng ngay khi Prometheus gọi vào "pull"
  private updateHardwareMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = (usedMem / totalMem) * 100;

    this.systemMemoryTotal.set(totalMem);
    this.systemMemoryFree.set(freeMem);
    this.systemMemoryUsagePercent.set(memPercent);

    // Tính toán % CPU sử dụng delta
    const currentCpuInfo = this.getAbsoluteCpuTime();
    const idleDifference = currentCpuInfo.idle - this.lastCpuInfo.idle;
    const totalDifference = currentCpuInfo.total - this.lastCpuInfo.total;

    if (totalDifference > 0) {
      const cpuPercent = (1 - idleDifference / totalDifference) * 100;
      this.systemCpuUsagePercent.set(cpuPercent);
    }

    // Lưu lại trạng thái cho lần pull kế tiếp
    this.lastCpuInfo = currentCpuInfo;
  }

  // Helper tính tổng thời gian hoạt động của các core CPU
  private getAbsoluteCpuTime(): { idle: number; total: number } {
    const cpus = os.cpus();
    let user = 0,
      nice = 0,
      sys = 0,
      idle = 0,
      irq = 0;

    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }

    return {
      idle,
      total: user + nice + sys + idle + irq,
    };
  }

  async getMetrics(): Promise<string> {
    this.updateHardwareMetrics();
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
