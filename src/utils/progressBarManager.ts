type ProgressTask = {
  fraction: number;
  delay: number;
  message: string;
};

export default class ProgressBarManager {
  private static _instance: ProgressBarManager | null = null;

  private scroll: HTMLDivElement;
  private titleContainer: HTMLDivElement;
  private loadingScreen: HTMLDivElement;
  private progressBar: HTMLProgressElement;
  private loadingMessage: HTMLLabelElement;

  private taskQueue: ProgressTask[];
  private isProcessing: boolean;
  private currentProgress: number;

  private taskCompletionCallbacks: Map<ProgressTask, () => void>;
  private constructor() {
    this.progressBar = document.querySelector(
      "#progress-bar"
    ) as HTMLProgressElement;
    this.loadingScreen = document.querySelector(
      ".loading-screen"
    ) as HTMLDivElement;
    this.titleContainer = document.querySelector(
      ".title-container"
    ) as HTMLDivElement;
    this.loadingMessage = document.querySelector(
      'label[for="progress-bar"]'
    ) as HTMLLabelElement;
    this.scroll = document.querySelector(".scroll") as HTMLDivElement;
    this.progressBar.value = 0;
    this.taskCompletionCallbacks = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
    this.currentProgress = 0;
  }

  public static getInstance(): ProgressBarManager {
    if (!ProgressBarManager._instance) {
      ProgressBarManager._instance = new ProgressBarManager();
    }
    return ProgressBarManager._instance;
  }

  updateProgress(fraction: number, message: string = "Loading", delay = 200) {
    return new Promise<void>((resolve) => {
      this.taskQueue.push({
        fraction,
        delay,
        message,
      });
      if (!this.isProcessing) {
        this.processQueue().catch(console.error);
      }

      const currentTask = this.taskQueue[this.taskQueue.length - 1];
      this.taskCompletionCallbacks.set(currentTask, resolve);
    });
  }

  async processQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) return;
    this.isProcessing = true;
    while (this.taskQueue.length > 0 && this.currentProgress < 100) {
      const task = this.taskQueue[0];
      const newProgress = Math.min(this.currentProgress + task.fraction, 100);
      this.loadingMessage.innerText = task.message;

      await this.animateProgress(this.currentProgress, newProgress);

      this.currentProgress = newProgress;
      if (this.currentProgress >= 100) {
        this.completeLoading();
      }

      const resolve = this.taskCompletionCallbacks.get(task);
      if (resolve) {
        resolve();
        this.taskCompletionCallbacks.delete(task);
      }

      this.taskQueue.shift();
      await new Promise((resolve) => setTimeout(resolve, task.delay));
    }
    this.isProcessing = false;
  }

  private animateProgress(from: number, to: number) {
    const duration = 200;
    const start = performance.now();

    return new Promise<void>((resolve) => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // Use easeInOutCubic for smooth animation
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.progressBar.value = from + (to - from) * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  private completeLoading() {
    this.loadingScreen.classList.add("hidden");
    this.titleContainer.classList.remove("hidden");
    this.scroll.classList.remove("hidden");
    document.body.style.overflow = "auto";
  }
}
