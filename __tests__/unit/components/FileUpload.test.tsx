import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '@/components/features/files/FileUpload';
import { filesService } from '@/lib/services/files.service';

// Mock the services
vi.mock('@/lib/services/files.service', () => ({
  filesService: {
    checkDuplicate: vi.fn(),
    uploadWithQueue: vi.fn(),
  },
}));

// Mock the store
vi.mock('@/stores/useAppStore', () => ({
  useAppStore: () => ({
    addFile: vi.fn(),
    uploadQueue: [],
    addToUploadQueue: vi.fn(),
    updateUploadProgress: vi.fn(),
    removeFromUploadQueue: vi.fn(),
    clearUploadQueue: vi.fn(),
  }),
}));

describe('FileUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload zone', () => {
    render(<FileUpload />);
    
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('Select Files')).toBeInTheDocument();
    expect(screen.getByText('Select Folder')).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const user = userEvent.setup();
    render(<FileUpload />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/select files/i).closest('input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('should show duplicate warning', async () => {
    const mockCheckDuplicate = vi.mocked(filesService.checkDuplicate);
    mockCheckDuplicate.mockResolvedValue({
      isDuplicate: true,
      existingFile: {
        id: '123',
        display_name: 'test.pdf',
        created_at: new Date().toISOString(),
        file_size: 1024,
      },
    });

    const user = userEvent.setup();
    render(<FileUpload />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/select files/i).closest('input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/Duplicate: This file already exists/)).toBeInTheDocument();
    });
  });

  it('should handle drag and drop', async () => {
    render(<FileUpload />);
    
    const dropZone = screen.getByText('Drag and drop files here').parentElement!;
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    // Simulate drag over
    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [file] },
    });
    
    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('should validate file types', async () => {
    const user = userEvent.setup();
    render(<FileUpload />);
    
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    const fileInput = screen.getByLabelText(/select files/i).closest('input') as HTMLInputElement;
    
    await user.upload(fileInput, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/File type not allowed/)).toBeInTheDocument();
    });
  });

  it('should handle clipboard paste', async () => {
    render(<FileUpload />);
    
    const blob = new Blob(['image data'], { type: 'image/png' });
    const clipboardEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    });
    
    // Add image item to clipboard data
    Object.defineProperty(clipboardEvent.clipboardData, 'items', {
      value: [{
        type: 'image/png',
        getAsFile: () => new File([blob], 'screenshot.png', { type: 'image/png' }),
      }],
    });
    
    document.dispatchEvent(clipboardEvent);
    
    await waitFor(() => {
      expect(screen.getByText(/screenshot-.*\.png/)).toBeInTheDocument();
    });
  });

  it('should handle upload progress', async () => {
    const mockUpload = vi.mocked(filesService.uploadWithQueue);
    mockUpload.mockImplementation(async (files, options) => {
      // Simulate progress callback
      if (options?.onFileProgress) {
        options.onFileProgress('temp-1', {
          fileId: 'temp-1',
          fileName: 'test.pdf',
          progress: 50,
          status: 'uploading',
        });
      }
      
      return {
        files: [{
          id: '123',
          user_id: 'user123',
          original_name: 'test.pdf',
          display_name: 'test.pdf',
          storage_url: 'path/to/file',
          file_type: 'application/pdf',
          file_size: 1024,
          file_hash: 'abc123',
          upload_source: 'web',
          is_academic_content: true,
          created_at: new Date(),
        }],
        errors: [],
      };
    });

    const user = userEvent.setup();
    render(<FileUpload />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/select files/i).closest('input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    // Click upload button
    const uploadButton = await screen.findByText(/Upload 1 file/);
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
    });
  });
});