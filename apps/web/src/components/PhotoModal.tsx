import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  Box,
  Text,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Input,
  Button,
  useToast,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: {
    id: string;
    url: string;
    description: string;
    tags: string[];
    timestamp: string;
  } | null;
  onPhotoUpdate: () => void;
}

const PhotoModal = ({ isOpen, onClose, photo, onPhotoUpdate }: PhotoModalProps) => {
  const [newTag, setNewTag] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const fetchTags = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOS.TAGS);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data: string[] = await response.json();
      setAvailableTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  if (!photo) return null;

  const filteredSuggestions = availableTags.filter(
    tag => tag.toLowerCase().includes(newTag.toLowerCase()) && !photo.tags.includes(tag)
  );

  const handleAddTag = async (tagToAdd: string = newTag) => {
    const tag = tagToAdd.trim().toLowerCase();
    if (!tag || photo.tags.includes(tag)) {
      setNewTag('');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PHOTOS.BASE}/${photo.id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tag');
      }

      const { tags } = await response.json();
      // Update the photo's tags immediately
      photo.tags = tags;
      // Refresh available tags
      await fetchTags();
      // Trigger parent update
      onPhotoUpdate();
      setNewTag('');
      setShowSuggestions(false);
      toast({
        title: 'Tag added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error adding tag',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PHOTOS.BASE}/${photo.id}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: tagToRemove }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove tag');
      }

      const { tags } = await response.json();
      // Update the photo's tags immediately
      photo.tags = tags;
      // Refresh available tags
      await fetchTags();
      // Trigger parent update
      onPhotoUpdate();
      toast({
        title: 'Tag removed',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: 'Error removing tag',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="black" maxW="100vw" maxH="100vh" m={0}>
        <ModalCloseButton color="white" zIndex={1000} />
        <ModalBody p={0} display="flex" flexDirection="column">
          <Flex flex="1" position="relative" alignItems="center" justifyContent="center" gap={4}>
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <Image
                src={photo.url}
                alt={photo.description || 'Photo'}
                maxH="calc(100vh - 40px)"
                maxW="100%"
                objectFit="contain"
              />
            </Box>
            <Box
              w="300px"
              p={4}
              color="white"
              bg="rgba(0, 0, 0, 0.5)"
              borderRadius="md"
              m={4}
            >
              {photo.description && (
                <Text fontSize="lg" mb={2}>
                  {photo.description}
                </Text>
              )}
              
              <Box mb={4}>
                <Text fontSize="sm" mb={2}>Tags</Text>
                <Flex wrap="wrap" gap={2} mb={2}>
                  {photo.tags.map((tag) => (
                    <Tag
                      key={tag}
                      size="sm"
                      variant="solid"
                      colorScheme="blue"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton
                        onClick={() => handleRemoveTag(tag)}
                        isDisabled={isUpdating}
                      />
                    </Tag>
                  ))}
                </Flex>
                <Box position="relative">
                  <Flex gap={2}>
                    <Input
                      ref={tagInputRef}
                      value={newTag}
                      onChange={(e) => {
                        setNewTag(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Add new tag"
                      size="sm"
                      bg="white"
                      color="black"
                      _placeholder={{ color: 'gray.500' }}
                      isDisabled={isUpdating}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddTag()}
                      isLoading={isUpdating}
                      isDisabled={!newTag.trim() || isUpdating}
                    >
                      Add
                    </Button>
                  </Flex>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <List
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg="white"
                      color="black"
                      borderRadius="md"
                      boxShadow="md"
                      zIndex={1000}
                      maxH="200px"
                      overflowY="auto"
                      mt={1}
                    >
                      {filteredSuggestions.map((tag) => (
                        <ListItem
                          key={tag}
                          px={3}
                          py={2}
                          cursor="pointer"
                          _hover={{ bg: 'gray.100' }}
                          onClick={() => handleAddTag(tag)}
                        >
                          {tag}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Box>

              <Text fontSize="sm" color="gray.300">
                Uploaded: {new Date(photo.timestamp).toLocaleString()}
              </Text>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PhotoModal; 