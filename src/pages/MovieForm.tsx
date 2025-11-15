import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Genre {
  _id: string;
  name: string;
}

interface MovieFormData {
  title: string;
  genreId: string;
  numberInStock: string;
  dailyRentalRate: string;
}

interface Errors {
  title?: string;
  genreId?: string;
  numberInStock?: string;
  dailyRentalRate?: string;
}

const MovieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    genreId: '',
    numberInStock: '',
    dailyRentalRate: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    fetchGenres();
    if (id) fetchMovie();
  }, [id]);

  const fetchGenres = async () => {
    try {
      const { data } = await api.get('/genres');
      setGenres(data);
    } catch (error) {
      toast.error('Failed to fetch genres');
    }
  };

  const fetchMovie = async () => {
    try {
      const { data } = await api.get(`/movies/${id}`);
      setFormData({
        title: data.title,
        genreId: data.genre._id,
        numberInStock: data.numberInStock.toString(),
        dailyRentalRate: data.dailyRentalRate.toString(),
      });
    } catch (error) {
      toast.error('Failed to fetch movie');
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.title || formData.title.length < 5 || formData.title.length > 50) {
      newErrors.title = 'Title must be between 5 and 50 characters';
    }

    if (!formData.genreId) {
      newErrors.genreId = 'Genre is required';
    }

    const stock = Number(formData.numberInStock);
    if (isNaN(stock) || stock < 0) {
      newErrors.numberInStock = 'Number in stock must be 0 or greater';
    }

    const rate = Number(formData.dailyRentalRate);
    if (isNaN(rate) || rate < 0) {
      newErrors.dailyRentalRate = 'Daily rental rate must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        genreId: formData.genreId,
        numberInStock: Number(formData.numberInStock),
        dailyRentalRate: Number(formData.dailyRentalRate),
      };

      if (id) {
        await api.put(`/movies/${id}`, payload);
        toast.success('Movie updated successfully');
      } else {
        await api.post('/movies', payload);
        toast.success('Movie created successfully');
      }

      navigate('/movies');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save movie';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/movies')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Movies
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Movie' : 'Add New Movie'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter movie title"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genreId">Genre</Label>
              <Select value={formData.genreId} onValueChange={(value) => setFormData({ ...formData, genreId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre._id} value={genre._id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genreId && <p className="text-sm text-destructive">{errors.genreId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberInStock">Number in Stock</Label>
              <Input
                id="numberInStock"
                type="number"
                min="0"
                value={formData.numberInStock}
                onChange={(e) => setFormData({ ...formData, numberInStock: e.target.value })}
                placeholder="Enter quantity"
              />
              {errors.numberInStock && <p className="text-sm text-destructive">{errors.numberInStock}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyRentalRate">Daily Rental Rate</Label>
              <Input
                id="dailyRentalRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.dailyRentalRate}
                onChange={(e) => setFormData({ ...formData, dailyRentalRate: e.target.value })}
                placeholder="Enter rate"
              />
              {errors.dailyRentalRate && <p className="text-sm text-destructive">{errors.dailyRentalRate}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : id ? 'Update Movie' : 'Create Movie'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/movies')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovieForm;
