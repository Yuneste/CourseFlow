'use client';

import { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/features/files/FileUpload';
import { FileCard } from '@/components/features/files/FileCard';
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
    : files.filter(f => !f.folder_id);

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
            <FolderOpen className="h-4 w-4 text-blue-600" />
          ) : (
            <Folder className="h-4 w-4 text-blue-600" />
          )}
          <span className="text-sm font-medium">{node.folder.name}</span>
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
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
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
            {/* Header with upload button */}
            <div className="flex items-center justify-between mb-4">
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
                        <FileCard
                          key={file.id}
                          file={file}
                          onDelete={handleFileDelete}
                          onDownload={handleFileDownload}
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
              /* Files Grid - No upload mode */
              currentFiles.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {currentFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDelete={handleFileDelete}
                    onDownload={handleFileDownload}
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
                  Click "Upload Files" to add your course materials
                </p>
              </Card>
            )}
            )}
          </div>
        </div>
      </div>
    </div>
  );
}