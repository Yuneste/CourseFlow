'use client';

import { useState } from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { filesService } from '@/lib/services/files.service';
import type { File as FileType } from '@/types';

interface FilePreviewProps {
  file: FileType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreview({ file, open, onOpenChange }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleView = async () => {
    if (previewUrl) return; // Already loaded
    
    setIsLoading(true);
    try {
      const downloadData = await filesService.getDownloadUrl(file.id);
      setPreviewUrl(downloadData.url);
    } catch (error) {
      console.error('Error getting preview URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const downloadData = await filesService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.download = downloadData.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const isImage = file.file_type.startsWith('image/');
  const isPDF = file.file_type === 'application/pdf';
  const isText = file.file_type.startsWith('text/');

  // Auto-load preview when dialog opens
  if (open && !previewUrl && !isLoading) {
    handleView();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              <span className="truncate">{file.display_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {(isPDF || isImage) && previewUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}

          {!isLoading && previewUrl && (
            <>
              {isImage && (
                <div className="flex items-center justify-center h-full relative w-full">
                  <Image
                    src={previewUrl}
                    alt={file.display_name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              {isPDF && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={file.display_name}
                />
              )}

              {isText && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[400px] border-0 bg-gray-50"
                  title={file.display_name}
                />
              )}

              {!isImage && !isPDF && !isText && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Preview not available</p>
                  <p className="text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}