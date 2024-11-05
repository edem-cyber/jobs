interface QueueJob {
  id: string;
  task: () => Promise<void>;
  retries?: number;
}

export class JobQueue {
  private queue: QueueJob[] = [];
  private processing: boolean = false;
  private maxRetries: number = 3;

  async add(job: QueueJob): Promise<void> {
    this.queue.push(job);
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const job = this.queue.shift()!;

    try {
      await job.task();
    } catch (error) {
      if ((job.retries || 0) < this.maxRetries) {
        this.queue.push({
          ...job,
          retries: (job.retries || 0) + 1
        });
      } else {
        console.error(`Job ${job.id} failed after ${this.maxRetries} retries`);
      }
    }

    // Process next job
    this.process();
  }
}