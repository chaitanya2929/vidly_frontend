import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';

interface Genre {
  _id: string;
  name: string;
}

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [genreName, setGenreName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const { data } = await api.get('/genres');
      setGenres(data);
    } catch (error) {
      toast.error('Failed to fetch genres');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    if (!genreName || genreName.length < 5 || genreName.length > 50) {
      setError('Genre name must be between 5 and 50 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (editingGenre) {
        await api.put(`/genres/${editingGenre._id}`, { name: genreName });
        toast.success('Genre updated successfully');
      } else {
        await api.post('/genres', { name: genreName });
        toast.success('Genre created successfully');
      }

      setDialogOpen(false);
      setGenreName('');
      setEditingGenre(null);
      fetchGenres();
    } catch (error: any) {
      const message = error.response?.data || 'Failed to save genre';
      toast.error(message);
    }
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setGenreName(genre.name);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this genre?')) return;

    try {
      await api.delete(`/genres/${id}`);
      toast.success('Genre deleted successfully');
      fetchGenres();
    } catch (error: any) {
      const message = error.response?.data || 'Failed to delete genre';
      toast.error(message);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setGenreName('');
    setEditingGenre(null);
    setError('');
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Genres</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Genres</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Genre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGenre ? 'Edit Genre' : 'Add New Genre'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Genre Name</Label>
                <Input
                  id="name"
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  placeholder="Enter genre name"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingGenre ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {genres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No genres found
                  </TableCell>
                </TableRow>
              ) : (
                genres.map((genre) => (
                  <TableRow key={genre._id}>
                    <TableCell className="font-medium">{genre.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(genre)}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(genre._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Genres;
