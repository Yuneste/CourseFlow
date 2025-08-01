'use client';

import { useState, useEffect } from 'react';
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
  Trash2,
  GripVertical,
  Check,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/features/files/FileUpload';
import { FileCardDraggable } from '@/components/features/files/FileCardDraggable';
import { CourseEditDialog } from '@/components/features/courses/CourseEditDialog';
import { useRouter } from 'next/navigation';
import { filesService } from '@/lib/services/files.service';
import { coursesService } from '@/lib/services/courses.service';
import { logger } from '@/lib/services/logger.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedFolder, setDraggedFolder] = useState<CourseFolder | null>(null);
  const [folderOrder, setFolderOrder] = useState<CourseFolder[]>([]);
  const [deletingFolder, setDeletingFolder] = useState<CourseFolder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);


  // Initialize folder order on mount or when folders change
  useEffect(() => {
    setFolderOrder([...folders].sort((a, b) => a.display_order - b.display_order));
  }, [folders]);

  // Build folder tree structure
  const buildFolderTree = (): FolderNode[] => {
    const orderedFolders = folderOrder.length > 0 ? folderOrder : folders;
    const rootFolders = orderedFolders.filter(f => !f.parent_id);
    
    const buildNode = (folder: CourseFolder): FolderNode => {
      const children = orderedFolders
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
    
    return rootFolders.sort((a, b) => a.display_order - b.display_order).map(buildNode);
  };

  const folderTree = buildFolderTree();
  const currentFiles = selectedFolder 
    ? files.filter(f => f.folder_id === selectedFolder.id)
    : files;

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
      router.refresh();
      toast.success(SUCCESS_MESSAGES.FILE_DELETED);
    } catch (error) {
      logger.error('Failed to delete file', error, {
        action: 'deleteFile',
        metadata: { fileId }
      });
      toast.error(ERROR_MESSAGES.GENERIC);
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
      logger.error('Failed to download file', error, {
        action: 'downloadFile',
        metadata: { fileId: file.id, fileName: file.display_name }
      });
      toast.error(ERROR_MESSAGES.GENERIC);
    }
  };

  const handleFileSelect = (fileId: string, isMultiple: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        if (!isMultiple) {
          newSet.clear();
        }
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDragStart = (file: File) => {
    if (!selectedFiles.has(file.id)) {
      setSelectedFiles(new Set([file.id]));
      setDraggedFiles([file.id]);
    } else {
      setDraggedFiles(Array.from(selectedFiles));
    }
  };

  const handleDragEnd = () => {
    setDraggedFiles([]);
    setDragOverFolder(null);
  };

  const handleFolderDrop = async (folderId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    if (draggedFiles.length === 0) return;
    
    try {
      // Move files to new folder
      for (const fileId of draggedFiles) {
        await filesService.updateFile(fileId, { folder_id: folderId });
      }
      
      setSelectedFiles(new Set());
      router.refresh();
      toast.success(`Moved ${draggedFiles.length} file(s)`);
    } catch (error) {
      logger.error('Failed to move files', error, {
        action: 'moveFiles',
        metadata: { fileCount: draggedFiles.length, targetFolderId: folderId }
      });
      toast.error(ERROR_MESSAGES.GENERIC);
    }
  };

  const handleFolderDragStart = (e: React.DragEvent, folder: CourseFolder) => {
    if (!reorderMode) return;
    setDraggedFolder(folder);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    if (!reorderMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFolderReorder = async (e: React.DragEvent, targetFolder: CourseFolder) => {
    e.preventDefault();
    if (!reorderMode || !draggedFolder || draggedFolder.id === targetFolder.id) return;

    const newOrder = [...folderOrder];
    const draggedIndex = newOrder.findIndex(f => f.id === draggedFolder.id);
    const targetIndex = newOrder.findIndex(f => f.id === targetFolder.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged folder
      const [removed] = newOrder.splice(draggedIndex, 1);
      // Insert at target position
      newOrder.splice(targetIndex, 0, removed);

      // Update display orders
      const updatedFolders = newOrder.map((folder, index) => ({
        ...folder,
        display_order: index
      }));

      setFolderOrder(updatedFolders);

      try {
        // Send only root folders to API (children maintain their parent relationships)
        const rootFoldersToUpdate = updatedFolders
          .filter(f => !f.parent_id)
          .map((f, index) => ({ id: f.id, display_order: index }));
        
        await coursesService.reorderFolders(rootFoldersToUpdate);
      } catch (error) {
        toast.error('Failed to reorder folders');
        // Revert on error
        setFolderOrder(folders);
      }
    }

    setDraggedFolder(null);
  };

  const handleFolderDragEnd = () => {
    setDraggedFolder(null);
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;

    try {
      await coursesService.deleteFolder(deletingFolder.id);
      setDeleteDialogOpen(false);
      setDeletingFolder(null);
      router.refresh();
      toast.success('Folder deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCourse = async () => {
    setIsDeletingCourse(true);
    try {
      await coursesService.deleteCourse(course.id);
      toast.success('Course deleted successfully');
      router.push('/courses');
    } catch (error) {
      toast.error('Failed to delete course');
      setIsDeletingCourse(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setIsCreatingFolder(true);
    try {
      await coursesService.createCourseFolder(course.id, newFolderName.trim());
      toast.success(SUCCESS_MESSAGES.FOLDER_CREATED || 'Folder created successfully');
      setNewFolderName('');
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      logger.error('Failed to create folder', error, {
        action: 'createFolder',
        metadata: { courseId: course.id, folderName: newFolderName }
      });
      toast.error(error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const renderFolderNode = (node: FolderNode, level: number = 0) => {
    const isSelected = selectedFolder?.id === node.folder.id;
    const hasChildren = node.children.length > 0;
    const hasContent = node.children.length > 0 || node.files.length > 0;
    const isDragOver = dragOverFolder === node.folder.id;
    
    return (
      <div key={node.folder.id} className="animate-in slide-in-from-left duration-300">
        <div
          className={cn(
            "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200",
            "hover:bg-primary/10",
            isSelected && "bg-primary/20",
            isDragOver && "bg-accent/30 scale-105",
            reorderMode && "cursor-move"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          draggable={reorderMode && level === 0} // Only allow dragging root folders
          onDragStart={(e) => handleFolderDragStart(e, node.folder)}
          onDragOver={handleFolderDragOver}
          onDrop={(e) => handleFolderReorder(e, node.folder)}
          onDragEnd={handleFolderDragEnd}
          onClick={() => {
            if (!reorderMode) {
              setSelectedFolder(node.folder);
              if (hasContent) {
                toggleFolder(node.folder.id);
              }
            }
          }}
          onDragOverCapture={(e) => {
            if (!reorderMode) {
              e.preventDefault();
              e.stopPropagation();
              setDragOverFolder(node.folder.id);
            }
          }}
          onDragLeave={(e) => {
            if (!reorderMode) {
              e.stopPropagation();
              if (dragOverFolder === node.folder.id) {
                setDragOverFolder(null);
              }
            }
          }}
          onDropCapture={(e) => {
            if (!reorderMode && draggedFiles.length > 0) {
              handleFolderDrop(node.folder.id, e);
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
          
          {reorderMode && (
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          )}
          
          {node.isExpanded ? (
            <FolderOpen className={cn(
              "h-4 w-4 transition-all duration-200",
              node.folder.is_special ? 'text-primary' : 'text-foreground',
              isDragOver && "scale-110"
            )} />
          ) : (
            <Folder className={cn(
              "h-4 w-4 transition-all duration-200",
              node.folder.is_special ? 'text-primary' : 'text-foreground',
              isDragOver && "scale-110"
            )} />
          )}
          <span className="text-sm font-medium flex-1 text-foreground">
            {node.folder.name}
            {node.folder.is_special && (
              <span className="text-xs text-muted-foreground ml-1">(AI-powered • Coming soon)</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {node.files.length > 0 && `(${node.files.length})`}
          </span>
          {!node.folder.is_special && !reorderMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingFolder(node.folder);
                setDeleteDialogOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              title="Delete folder"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </button>
          )}
        </div>
        
        {node.isExpanded && (
          <div className="animate-in slide-in-from-top-1 duration-200">
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="relative z-30 bg-card/95 backdrop-blur-md border-b border-border sticky top-0 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/courses')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <div className="flex items-center gap-4 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                  <span className="text-5xl relative z-10">
                    {course.emoji}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{course.name}</h1>
                  <p className="text-sm text-muted-foreground">
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
              className="hover:scale-105 transition-transform"
            >
              <Settings className="h-4 w-4 mr-2" />
              Course Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folder Structure */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24 animate-in slide-in-from-left duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Folders</h2>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant={reorderMode ? "default" : "ghost"}
                    onClick={() => setReorderMode(!reorderMode)}
                    title="Reorder folders"
                  >
                    {reorderMode ? <Check className="h-4 w-4" /> : <GripVertical className="h-4 w-4" />}
                  </Button>
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
              </div>
              
              <div className="space-y-1">
                {/* All Files */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    !selectedFolder && "bg-primary/10"
                  )}
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
            {/* Header */}
            <div className="flex items-center justify-between animate-in slide-in-from-right duration-500">
              <h2 className="text-lg font-semibold">
                {selectedFolder ? selectedFolder.name : 'All Files'}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  size="sm"
                  variant={showUpload ? "default" : "outline"}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {showUpload ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Close Upload
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    onClick={() => setShowEditDialog(true)}
                    size="sm"
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => setShowDeleteCourseDialog(true)}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-105"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Bulk actions bar */}
            {(selectedFiles.size > 0 || currentFiles.length > 0) && (
              <Card className="p-3 bg-muted/50 border-border animate-in slide-in-from-top-2 duration-300">
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
                        className="hover:scale-105 transition-transform"
                      >
                        Select All
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isDownloading || selectedFiles.size === 0}
                      onClick={async () => {
                        setIsDownloading(true);
                        try {
                          const fileIds = Array.from(selectedFiles);
                          for (let i = 0; i < fileIds.length; i++) {
                            const file = currentFiles.find(f => f.id === fileIds[i]);
                            if (file) {
                              await handleFileDownload(file);
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
                      className="hover:scale-105 transition-transform"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:scale-105 transition-transform"
                      disabled={selectedFiles.size === 0}
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
                    {selectedFiles.size > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFiles(new Set())}
                        className="hover:scale-105 transition-transform"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Upload Section */}
            {showUpload && (
              <Card className="overflow-hidden animate-in slide-in-from-top duration-300">
                <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Upload Files</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => !uploadingFiles && setShowUpload(false)}
                    disabled={uploadingFiles}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-6">
                  <FileUpload
                    courseId={course.id}
                    folderId={selectedFolder?.id}
                    onUploadComplete={() => {
                      setUploadingFiles(false);
                      router.refresh();
                      // Auto-close after successful upload if no other uploads are pending
                      setTimeout(() => {
                        if (!uploadingFiles) {
                          setShowUpload(false);
                        }
                      }, 1500);
                    }}
                    onUploadStart={() => {
                      setUploadingFiles(true);
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Files Grid */}
            {currentFiles.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {currentFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <FileCardDraggable
                      file={file}
                      isSelected={selectedFiles.has(file.id)}
                      onSelect={handleFileSelect}
                      onDelete={handleFileDelete}
                      onDownload={handleFileDownload}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center animate-in fade-in duration-500">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No files in {selectedFolder ? 'this folder' : 'this course'} yet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click &quot;Upload Files&quot; to add your course materials
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the folder &quot;{deletingFolder?.name}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingFolder(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <CourseEditDialog
        course={course}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={showDeleteCourseDialog} onOpenChange={setShowDeleteCourseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course{' '}
              &quot;<strong>{course.name}</strong>&quot; and all of its files, folders, and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeletingCourse}
            >
              {isDeletingCourse ? 'Deleting...' : 'Yes, delete course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}