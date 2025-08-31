import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileImage, Upload, FolderOpen, Download, Trash2 } from 'lucide-react';

interface MediaProps {
  currentWebsite: any;
}

export function Media({ currentWebsite }: MediaProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-muted-foreground">Manage your website's images, documents, and files</p>
        </div>
        <Button disabled>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">2.1 GB</p>
              </div>
              <FileImage className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">347</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">7.9 GB</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Manager */}
      <Card>
        <CardHeader>
          <CardTitle>File Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileImage className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Advanced File Management</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse, upload, organize, and manage all your website files directly from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" disabled>
                <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
                Browse Files
              </Button>
              <Button variant="outline" disabled>
                <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
                Upload Media
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload multiple files at once with drag-and-drop support.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
              Start Bulk Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Cleanup Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Find and remove unused files to optimize storage space.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
              Scan for Unused Files
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
              <FileImage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">File Management Tips</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                For now, you can manage files through your WordPress admin panel. Advanced file management 
                features including direct upload, organization tools, and storage optimization are coming soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}