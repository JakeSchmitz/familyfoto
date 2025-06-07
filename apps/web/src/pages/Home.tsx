import { Box, Flex, Heading, Text, VStack, SimpleGrid, Image, Spinner, Center } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import PhotoModal from '../components/PhotoModal';

interface Photo {
  id: string;
  url: string;
  name: string;
  description: string;
  tags: string[];
  timestamp: string;
}

interface HomeProps {
  selectedFilterTags: string[];
}

const API_URL = import.meta.env.VITE_API_URL;

const Home = ({ selectedFilterTags }: HomeProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams();
        if (selectedFilterTags.length > 0) {
          selectedFilterTags.forEach(tag => queryParams.append('tags', tag));
        }

        const response = await fetch(`${API_URL}/api/photos?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Photo[] = await response.json();
        setPhotos(data);
      } catch (e: any) {
        setError(`Failed to fetch photos: ${e.message}`);
        console.error("Error fetching photos:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [selectedFilterTags]);

  return (
    <Flex
      direction="column"
      width="100%"
      flex="1"
    >
      {/* Main Content - Image Viewer */}
      <Box flex="1" p={6} overflowY="auto"> 
        {/* <Heading mb={6} textAlign="center" color="gray.800">Your Photos</Heading> */}
        
        {loading && (
          <Center py={10}>
            <Spinner size="xl" />
          </Center>
        )}

        {error && (
          <Center py={10}>
            <Text color="red.500">{error}</Text>
          </Center>
        )}

        {!loading && !error && photos.length === 0 && (
          <Center py={10}>
            <Text color="gray.500">No photos uploaded yet. Upload some from the sidebar!</Text>
          </Center>
        )}

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {photos.map((photo) => (
            <Box 
              key={photo.id} 
              borderWidth="1px" 
              borderRadius="lg" 
              overflow="hidden" 
              boxShadow="md"
              cursor="pointer"
              onClick={() => setSelectedPhoto(photo)}
              _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
            >
              <Image src={`${API_URL}${photo.url}`} alt={photo.description || photo.name} w="100%" h="200px" objectFit="cover" />
              <Box p="4">
                <Text fontWeight="semibold" fontSize="md">{photo.description || 'Untitled'}</Text>
                {photo.tags && photo.tags.length > 0 && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {photo.tags.join(', ')}
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <PhotoModal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        photo={selectedPhoto ? {
          url: `${API_URL}${selectedPhoto.url}`,
          description: selectedPhoto.description,
          tags: selectedPhoto.tags,
          timestamp: selectedPhoto.timestamp
        } : null}
      />
    </Flex>
  );
};

export default Home;