import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Text,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
} from '@chakra-ui/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ExifReader from 'exifreader';
import { API_ENDPOINTS } from '../config/api';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const defaultTags = ["family", "wildlife", "other"];

const UploadPhotoModal = ({ isOpen, onClose, onUploadSuccess }: UploadPhotoModalProps) => {
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [locationData, setLocationData] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getCityFromCoordinates = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      console.log('Getting city for coordinates:', { latitude, longitude });
      
      // Add a small delay to respect rate limiting (max 1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FamilyFoto/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limit exceeded for Nominatim API');
          return null;
        }
        throw new Error(`Geocoding request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Geocoding response:', data);

      if (data.address) {
        // Try to get the most specific location name available
        const cityName = data.address.city || data.address.town || data.address.village || data.address.county || null;
        console.log('Found city name:', cityName);
        return cityName;
      }
      console.log('No address found in response');
      return null;
    } catch (error) {
      console.error('Error getting city from coordinates:', error);
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      console.log('Processing file:', droppedFile.name);
      
      // Cleanup previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create new preview URL
      const newPreviewUrl = URL.createObjectURL(droppedFile);
      setPreviewUrl(newPreviewUrl);
      setFile(droppedFile);
      setLocationData(null); // Clear previous location

      try {
        console.log('Loading EXIF data...');
        const tags = await ExifReader.load(droppedFile, { expanded: true });
        console.log('EXIF data:', tags);

        if (tags.gps && tags.gps.Latitude && tags.gps.Longitude) {
          console.log('Found GPS data:', {
            latitude: tags.gps.Latitude,
            longitude: tags.gps.Longitude
          });

          // Get city name from coordinates
          const cityName = await getCityFromCoordinates(tags.gps.Latitude, tags.gps.Longitude);
          
          if (cityName) {
            // Add location as a tag
            const locationTag = `location:${cityName.toLowerCase()}`;
            console.log('Adding location tag:', locationTag);
            if (!selectedTags.includes(locationTag)) {
              setSelectedTags(prev => [...prev, locationTag]);
            }
            setLocationData(`Location: ${cityName} (${tags.gps.Latitude}, ${tags.gps.Longitude})`);
          } else {
            console.log('No city name found for coordinates');
            setLocationData(`Location: ${tags.gps.Latitude}, ${tags.gps.Longitude}`);
          }
        } else {
          console.log('No GPS data found in EXIF');
          setLocationData('Location: Not available');
        }
      } catch (error) {
        console.error('Error reading EXIF data:', error);
        setLocationData('Location: Error reading data');
      }
    }
  }, [selectedTags, previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      setSelectedTags((prev) => [...prev, normalizedTag]);
      setTagInputValue('');
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInputValue.trim() !== '') {
      e.preventDefault(); // Prevent form submission
      handleAddTag(tagInputValue);
    }
  };

  const suggestedTags = defaultTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInputValue.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setDescription('');
      setSelectedTags([]);
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setLocationData(null);
      setTagInputValue('');
      setIsUploading(false);
    }
  }, [isOpen, previewUrl]);

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(selectedTags));
    if (locationData && locationData !== 'Location: Not available' && locationData !== 'Location: Error reading data') {
      formData.append('location', locationData);
    }

    try {
      const response = await fetch(API_ENDPOINTS.PHOTOS.UPLOAD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Photo</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Box
              {...getRootProps()}
              w="100%"
              h="200px"
              border="2px dashed"
              borderColor={isDragActive ? "blue.400" : "gray.200"}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={isDragActive ? "blue.50" : "gray.50"}
              cursor="pointer"
              _hover={{ borderColor: "blue.400" }}
              position="relative"
              overflow="hidden"
            >
              <input {...getInputProps()} />
              {file && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Text color="gray.500">
                  {isDragActive
                    ? "Drop the photo here..."
                    : "Drag and drop a photo here, or click to select"}
                </Text>
              )}
            </Box>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for your photo"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Input
                ref={tagInputRef}
                value={tagInputValue}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (e.g., family, wildlife, other) or type new ones"
              />
              {selectedTags.length > 0 && (
                <Flex wrap="wrap" mt={2} maxW="100%">
                  {selectedTags.map((tag) => (
                    <Tag
                      key={tag}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                      mr={2}
                      mb={2}
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                    </Tag>
                  ))}
                </Flex>
              )}
              {suggestedTags.length > 0 && tagInputValue.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" color="gray.500" mb={1}>Suggestions:</Text>
                  <Flex wrap="wrap">
                    {suggestedTags.map((tag) => (
                      <Button
                        key={tag}
                        size="sm"
                        variant="outline"
                        mr={2}
                        mb={2}
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </Flex>
                </Box>
              )}
            </FormControl>

            {locationData && (
              <Box w="100%">
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {locationData}
                </Text>
              </Box>
            )}

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!file || isUploading}
              isLoading={isUploading}
              loadingText="Uploading..."
              w="100%"
            >
              Upload Photo
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadPhotoModal; 