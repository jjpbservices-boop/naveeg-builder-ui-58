import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Home,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Globe,
  Info
} from 'lucide-react';
import { useTenWebApi } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardPagesProps {
  currentWebsite: any;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'private';
  type: 'page' | 'post';
  created_at: string;
  updated_at: string;
  is_front_page: boolean;
  excerpt?: string;
}

export function DashboardPages({ currentWebsite }: DashboardPagesProps) {
  const { canUseAdvancedPages } = useFeatureGate();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageContent, setNewPageContent] = useState('');

  const { execute: getPages, loading: pagesLoading } = useTenWebApi({
    showErrorToast: true
  });

  const { execute: createPage } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'Page created successfully'
  });

  const { execute: updatePage } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'Page updated successfully'
  });

  const { execute: deletePage } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'Page deleted successfully'
  });

  const { execute: setFrontPage } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'Front page updated successfully'
  });

  const loadPages = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      const response = await getPages(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/pages`)
          .then(res => res.json())
      );
      
      if (response?.pages) {
        setPages(response.pages);
      }
    } catch (error) {
      // Use mock data for now
      const mockPages: Page[] = [
        {
          id: '1',
          title: 'Home',
          slug: 'home',
          status: 'published',
          type: 'page',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          is_front_page: true,
          excerpt: 'Welcome to our website homepage'
        },
        {
          id: '2', 
          title: 'About Us',
          slug: 'about',
          status: 'published',
          type: 'page',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          is_front_page: false,
          excerpt: 'Learn more about our company and mission'
        },
        {
          id: '3',
          title: 'Contact',
          slug: 'contact',
          status: 'draft',
          type: 'page',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          is_front_page: false,
          excerpt: 'Get in touch with us'
        }
      ];
      setPages(mockPages);
    }
  };

  useEffect(() => {
    if (currentWebsite?.id && canUseAdvancedPages) {
      loadPages();
    }
  }, [currentWebsite?.id, canUseAdvancedPages]);

  if (!canUseAdvancedPages) {
    return (
      <LockedFeature
        featureName="Advanced Pages Management"
        description="Create, edit, and manage your website pages directly from the dashboard"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a page title',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPage(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newPageTitle.trim(),
            content: newPageContent.trim() || `<h1>${newPageTitle}</h1><p>This is a new page.</p>`,
            status: 'draft'
          })
        }).then(res => res.json())
      );
      
      setShowCreateDialog(false);
      setNewPageTitle('');
      setNewPageContent('');
      setTimeout(() => loadPages(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (pageId: string, newStatus: string) => {
    try {
      await updatePage(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }).then(res => res.json())
      );
      
      setTimeout(() => loadPages(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update page status',
        variant: 'destructive',
      });
    }
  };

  const handleSetFrontPage = async (pageId: string) => {
    try {
      await setFrontPage(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/pages/${pageId}/set-front`, {
          method: 'POST'
        }).then(res => res.json())
      );
      
      setTimeout(() => loadPages(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set front page',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/pages/${pageId}`, {
          method: 'DELETE'
        }).then(res => res.json())
      );
      
      setTimeout(() => loadPages(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPages.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select pages to perform bulk actions',
        variant: 'destructive',
      });
      return;
    }

    try {
      await Promise.all(
        selectedPages.map(pageId => {
          switch (action) {
            case 'publish':
              return handleStatusChange(pageId, 'published');
            case 'draft':
              return handleStatusChange(pageId, 'draft');
            case 'delete':
              return handleDeletePage(pageId);
            default:
              return Promise.resolve();
          }
        })
      );
      
      setSelectedPages([]);
      toast({
        title: 'Success',
        description: `Bulk ${action} completed successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to perform bulk ${action}`,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="outline" className="text-success border-success/50"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-warning border-warning/50"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'private':
        return <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50"><EyeOff className="h-3 w-3 mr-1" />Private</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pages Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your website pages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadPages} variant="outline" size="sm" disabled={pagesLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${pagesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPages.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('draft')}
                >
                  Draft
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPages([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Website Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pages Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first page to get started.</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Page
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPages.length === pages.length}
                      onCheckedChange={(checked) => 
                        setSelectedPages(checked ? pages.map(p => p.id) : [])
                      }
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPages.includes(page.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPages([...selectedPages, page.id]);
                          } else {
                            setSelectedPages(selectedPages.filter(id => id !== page.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{page.title}</span>
                          {page.is_front_page && (
                            <Badge variant="default" className="text-xs">
                              <Home className="h-3 w-3 mr-1" />
                              Front Page
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{page.slug}</p>
                        {page.excerpt && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {page.excerpt}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(page.status)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{page.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(page.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(page.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={page.status}
                          onValueChange={(value) => handleStatusChange(page.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {!page.is_front_page && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetFrontPage(page.id)}
                            title="Set as front page"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={`${currentWebsite?.site_url}/${page.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="View page"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePage(page.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Enter page title"
              />
            </div>

            <div className="space-y-2">
              <Label>Page Content (Optional)</Label>
              <Textarea
                value={newPageContent}
                onChange={(e) => setNewPageContent(e.target.value)}
                placeholder="Enter page content or leave empty for a blank page"
                className="min-h-[120px]"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The page will be created as a draft. You can edit it further in WordPress admin and publish when ready.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleCreatePage}
                disabled={!newPageTitle.trim()}
              >
                Create Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}