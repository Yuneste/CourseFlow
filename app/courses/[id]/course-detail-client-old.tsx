'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Course, CourseFolder, File } from '@/types';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Upload, 
  ArrowLeft,
  Settings,
  Plus,
  ChevronRight,
  ChevronDown,
  Download,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/features/files/FileUpload';
import { FileCardDraggable } from '@/components/features/files/FileCardDraggable';
import { useRouter } from 'next/navigation';
import { filesService } from '@/lib/services/files.service';

interface CourseDetailClientProps {
  course: Course;
  folders: CourseFolder[];
  files: File[];
}

interface FolderNode {
  folder: CourseFolder;
  children: FolderNode[];
  files: File[];
  isExpanded: boolean;
}

export function CourseDetailClient({ course, folders, files }: CourseDetailClientProps) {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState<CourseFolder | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [draggedFiles, setDraggedFiles] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Build folder tree structure
  const buildFolderTree = (): FolderNode[] => {
    const rootFolders = folders.filter(f => !f.parent_id);
    
    const buildNode = (folder: CourseFolder): FolderNode => {
      const children = folders
        .filter(f => f.parent_id === folder.id)
        .map(buildNode);
      
      const folderFiles = files.filter(f => f.folder_id === folder.id);
      
      return {
        folder,
        children,
        files: folderFiles,
        isExpanded: expandedFolders.has(folder.id)
      };
    };
    
    return rootFolders.map(buildNode);
  };

  const folderTree = buildFolderTree();
  const currentFiles = selectedFolder 
    ? files.filter(f => f.folder_id === selectedFolder.id)
    : files; // Show all files when "All Files" is selected

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await filesService.deleteFile(fileId);
      // Refresh the page to update the file list
      router.refresh();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleFileDownload = async (file: File) => {
    try {
      const downloadInfo = await filesService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadInfo.url;
      link.download = file.display_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleFileSelect = (fileId: string, isMultiple: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      // Always toggle on click
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        // If not multi-select (Ctrl/Cmd held), clear others first
        if (!isMultiple) {
          newSet.clear();
        }
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDragStart = (file: File) => {
    // If the dragged file is not selected, select only it
    if (!selectedFiles.has(file.id)) {
      setSelectedFiles(new Set([file.id]));
      setDraggedFiles([file.id]);
    } else {
      // If it's selected, drag all selected files
      setDraggedFiles(Array.from(selectedFiles));
    }
  };

  const handleDragEnd = () => {
    setDraggedFiles([]);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await fetch('/api/courses/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          name: newFolderName.trim(),
          parent_id: null,
        }),
      });

      if (response.ok) {
        toast.success('Folder created successfully');
        setNewFolderName('');
        setDialogOpen(false);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const renderFolderNode = (node: FolderNode, level: number = 0) => {
    const isSelected = selectedFolder?.id === node.folder.id;
    const hasChildren = node.children.length > 0 || node.files.length > 0;
    
    return (
      <div key={node.folder.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-gray-100' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            setSelectedFolder(node.folder);
            if (hasChildren) {
              toggleFolder(node.folder.id);
            }
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.folder.id);
              }}
              className="p-0.5"
            >
              {node.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          {node.isExpanded ? (
            <FolderOpen className={`h-4 w-4 ${node.folder.is_special ? 'text-purple-600' : 'text-blue-600'}`} />
          ) : (
            <Folder className={`h-4 w-4 ${node.folder.is_special ? 'text-purple-600' : 'text-blue-600'}`} />
          )}
          <span className="text-sm font-medium">
            {node.folder.name}
            {node.folder.is_special && (
              <span className="text-xs text-purple-600 ml-1">(AI-powered • Coming soon)</span>
            )}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            {node.files.length > 0 && `(${node.files.length})`}
          </span>
        </div>
        
        {node.isExpanded && (
          <div>
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{course.emoji}</span>
                <div>
                  <h1 className="text-2xl font-bold">{course.name}</h1>
                  <p className="text-sm text-gray-600">
                    {course.code && `${course.code} • `}
                    {course.professor && `Prof. ${course.professor} • `}
                    {course.term}
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/courses/${course.id}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Course Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folder Structure */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Folders</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                          id="folder-name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter folder name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isCreatingFolder) {
                              handleCreateFolder();
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            setNewFolderName('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateFolder}
                          disabled={isCreatingFolder || !newFolderName.trim()}
                        >
                          {isCreatingFolder ? 'Creating...' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-1">
                {/* Root level - All Files */}
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 ${
                    !selectedFolder ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <div className="w-4" />
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">All Files</span>
                </div>
                
                {/* Folder tree */}
                {folderTree.map(node => renderFolderNode(node))}
              </div>
            </Card>
          </div>

          {/* Main Content - Files */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header with upload button and bulk actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedFolder ? selectedFolder.name : 'All Files'}
                </h2>
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  variant={showUpload ? 'secondary' : 'default'}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {showUpload ? 'Hide Upload' : 'Upload Files'}
                </Button>
              </div>
              
              {/* Bulk actions bar */}
              {(selectedFiles.size > 0 || currentFiles.length > 0) && (
                <Card className="p-3 bg-muted/50 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedFiles.size > 0 
                        ? `${selectedFiles.size} file${selectedFiles.size > 1 ? 's' : ''} selected`
                        : `${currentFiles.length} file${currentFiles.length > 1 ? 's' : ''} available`
                      }
                    </span>
                    <div className="flex gap-2">
                      {selectedFiles.size !== currentFiles.length && currentFiles.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const allFileIds = new Set(currentFiles.map(f => f.id));
                            setSelectedFiles(allFileIds);
                          }}
                        >
                          Select All
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDownloading}
                        onClick={async () => {
                          setIsDownloading(true);
                          try {
                            // Download selected files with delay to prevent browser blocking
                            const fileIds = Array.from(selectedFiles);
                            for (let i = 0; i < fileIds.length; i++) {
                              const file = currentFiles.find(f => f.id === fileIds[i]);
                              if (file) {
                                await handleFileDownload(file);
                                // Add delay between downloads to prevent browser from blocking
                                if (i < fileIds.length - 1) {
                                  await new Promise(resolve => setTimeout(resolve, 500));
                                }
                              }
                            }
                            toast.success(`Downloaded ${fileIds.length} file${fileIds.length > 1 ? 's' : ''}`);
                          } finally {
                            setIsDownloading(false);
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm(`Delete ${selectedFiles.size} selected files?`)) {
                            const fileIds = Array.from(selectedFiles);
                            for (const fileId of fileIds) {
                              await handleFileDelete(fileId);
                            }
                            setSelectedFiles(new Set());
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFiles(new Set())}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Content area with upload on left, files on right when uploading */}
            {showUpload ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section - Left */}
                <Card className="p-6 h-fit">
                  <h3 className="text-sm font-medium mb-4">Upload Files</h3>
                  <FileUpload
                    courseId={course.id}
                    folderId={selectedFolder?.id}
                    onUploadComplete={() => {
                      router.refresh();
                    }}
                  />
                </Card>

                {/* Files Grid - Right */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Files in {selectedFolder ? 'folder' : 'course'}</h3>
                  {currentFiles.length > 0 ? (
                    <div className="space-y-3">
                      {currentFiles.map((file) => (
                        <FileCardDraggable
                          key={file.id}
                          file={file}
                          isSelected={selectedFiles.has(file.id)}
                          onSelect={handleFileSelect}
                          onDelete={handleFileDelete}
                          onDownload={handleFileDownload}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        No files yet
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Files Grid - No upload mode */}
                {currentFiles.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {currentFiles.map((file) => (
                      <FileCardDraggable
                        key={file.id}
                        file={file}
                        isSelected={selectedFiles.has(file.id)}
                        onSelect={handleFileSelect}
                        onDelete={handleFileDelete}
                        onDownload={handleFileDownload}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No files in {selectedFolder ? 'this folder' : 'this course'} yet
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Click &quot;Upload Files&quot; to add your course materials
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}