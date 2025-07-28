/**
 * AI Processing Queue for post-upload tasks
 */

export interface AIProcessingTask {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  taskType: 'categorization' | 'summary' | 'text_extraction' | 'translation';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retryCount: number;
}

class AIProcessingQueue {
  private queue: AIProcessingTask[] = [];
  private processing: Set<string> = new Set();
  private maxConcurrent: number = 3;
  private storageKey = 'courseflow_ai_processing_queue';

  constructor() {
    // Load queue from localStorage on initialization
    this.loadQueue();
    
    // Start processing loop
    this.startProcessingLoop();
  }

  /**
   * Add a task to the processing queue
   */
  addTask(task: Omit<AIProcessingTask, 'id' | 'createdAt' | 'status' | 'retryCount'>): string {
    const newTask: AIProcessingTask = {
      ...task,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
    };

    this.queue.push(newTask);
    this.saveQueue();
    
    // Process immediately if under limit
    this.processNext();
    
    return newTask.id;
  }

  /**
   * Queue standard AI tasks for a newly uploaded file
   */
  queueFileProcessing(file: {
    id: string;
    name: string;
    type: string;
    courseId?: string;
  }): string[] {
    const taskIds: string[] = [];

    // Always queue categorization
    taskIds.push(
      this.addTask({
        fileId: file.id,
        fileName: file.name,
        fileType: file.type,
        taskType: 'categorization',
        priority: 'high',
      })
    );

    // Queue text extraction for documents
    if (
      file.type === 'application/pdf' ||
      file.type.includes('word') ||
      file.type.includes('text')
    ) {
      taskIds.push(
        this.addTask({
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          taskType: 'text_extraction',
          priority: 'medium',
        })
      );

      // Queue summary generation
      taskIds.push(
        this.addTask({
          fileId: file.id,
          fileName: file.name,
          fileType: file.type,
          taskType: 'summary',
          priority: 'low',
        })
      );
    }

    return taskIds;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): AIProcessingTask | undefined {
    return this.queue.find(task => task.id === taskId);
  }

  /**
   * Get all tasks for a file
   */
  getFileTask(fileId: string): AIProcessingTask[] {
    return this.queue.filter(task => task.fileId === fileId);
  }

  /**
   * Process the next task in queue
   */
  private async processNext(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent) {
      return;
    }

    // Find next pending task by priority
    const nextTask = this.queue
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })[0];

    if (!nextTask) {
      return;
    }

    // Mark as processing
    nextTask.status = 'processing';
    nextTask.startedAt = new Date();
    this.processing.add(nextTask.id);
    this.saveQueue();

    try {
      // Process based on task type
      const result = await this.processTask(nextTask);
      
      // Mark as completed
      nextTask.status = 'completed';
      nextTask.completedAt = new Date();
      nextTask.result = result;
    } catch (error) {
      // Handle failure
      nextTask.retryCount++;
      
      if (nextTask.retryCount < 3) {
        // Retry later
        nextTask.status = 'pending';
        delete nextTask.startedAt;
      } else {
        // Mark as failed after max retries
        nextTask.status = 'failed';
        nextTask.completedAt = new Date();
        nextTask.error = error instanceof Error ? error.message : 'Processing failed';
      }
    } finally {
      this.processing.delete(nextTask.id);
      this.saveQueue();
      
      // Process next task
      this.processNext();
    }
  }

  /**
   * Process a specific task
   */
  private async processTask(task: AIProcessingTask): Promise<any> {
    // Simulate processing with timeout
    // In production, this would call actual AI services
    await new Promise(resolve => setTimeout(resolve, 2000));

    switch (task.taskType) {
      case 'categorization':
        return {
          category: this.detectCategory(task.fileName, task.fileType),
          confidence: 0.85,
        };

      case 'text_extraction':
        return {
          text: 'Extracted text content...',
          pageCount: 10,
          wordCount: 1500,
        };

      case 'summary':
        return {
          summary: 'This document discusses key concepts...',
          keyPoints: ['Point 1', 'Point 2', 'Point 3'],
          language: 'en',
        };

      case 'translation':
        return {
          translatedSummary: 'Translated summary...',
          targetLanguage: 'es',
        };

      default:
        throw new Error(`Unknown task type: ${task.taskType}`);
    }
  }

  /**
   * Simple category detection based on filename
   */
  private detectCategory(fileName: string, fileType: string): string {
    const name = fileName.toLowerCase();
    
    if (name.includes('lecture') || name.includes('class')) {
      return 'lecture';
    }
    if (name.includes('assignment') || name.includes('homework') || name.includes('hw')) {
      return 'assignment';
    }
    if (name.includes('exam') || name.includes('test') || name.includes('quiz')) {
      return 'exam';
    }
    if (name.includes('notes') || name.includes('summary')) {
      return 'notes';
    }
    
    return 'other';
  }

  /**
   * Start the processing loop
   */
  private startProcessingLoop(): void {
    // Check for tasks to process every 5 seconds
    setInterval(() => {
      this.cleanupOldTasks();
      this.processNext();
    }, 5000);
  }

  /**
   * Clean up old completed/failed tasks
   */
  private cleanupOldTasks(): void {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24); // Keep tasks for 24 hours

    this.queue = this.queue.filter(task => {
      if (task.status === 'completed' || task.status === 'failed') {
        return task.completedAt && task.completedAt > cutoffDate;
      }
      return true;
    });

    this.saveQueue();
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save AI processing queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load AI processing queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: this.queue.length,
    };

    this.queue.forEach(task => {
      stats[task.status]++;
    });

    return stats;
  }
}

// Export singleton instance
export const aiProcessingQueue = new AIProcessingQueue();