import { Box, Flex, Heading, Text, VStack, SimpleGrid, Image, Spinner, Center, IconButton, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { DeleteIcon } from '@chakra-ui/icons';
import { API_ENDPOINTS } from '../config/api';
import { Photo } from '../types';
import PhotoCard from '../components/PhotoCard';
import PhotoModal from '../components/PhotoModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface HomeProps {
  currentUserId?: number;
  selectedFilterTags?: string[];
}

const Home: React.FC<HomeProps> = ({ currentUserId, selectedFilterTags = [] }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.PHOTOS.BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError('Failed to load photos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handlePhotoDelete = () => {
    // Refresh the photos list after deletion
    fetchPhotos();
  };

  return (
    <Box maxW="container.xl" mx="auto" px={4} py={8}>
      <Heading as="h1" size="xl" mb={8}>
        Family Photos
      </Heading>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
              onDelete={handlePhotoDelete}
              currentUserId={currentUserId}
            />
          ))}
        </SimpleGrid>
      )}

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          currentUserId={currentUserId}
          onDelete={handlePhotoDelete}
        />
      )}
    </Box>
  );
};

export default Home;