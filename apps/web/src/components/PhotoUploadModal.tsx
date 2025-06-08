import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  List,
  ListItem,
  Box,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

const PhotoUploadModal = ({ isOpen, onClose, onUploadComplete }: PhotoUploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/tags`);
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data: string[] = await response.json();
        setAvailableTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, [isOpen]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: true
  });

  const handleAddTag = (tagToAdd: string = newTag) => {
    const tag = tagToAdd.trim().toLowerCase();
    if (!tag || tags.includes(tag)) {
      setNewTag('');
      return;
    }
    setTags([...tags, tag]);
    setNewTag('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = availableTags.filter(
    tag => tag.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(tag)
  );

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one photo to upload',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    formData.append('description', description);
    tags.forEach(tag => {
      formData.append('tags', tag);
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast({
        title: 'Upload successful',
        description: `${files.length} photo(s) uploaded successfully`,
        status: 'success',
        duration: 3000,
      });

      setFiles([]);
      setDescription('');
      setTags([]);
      setNewTag('');
      
      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your photos',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setDescription('');
      setTags([]);
      setNewTag('');
      setShowSuggestions(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Photos</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Box
              {...getRootProps()}
              p={10}
              border="2px dashed"
              borderColor={isDragActive ? 'blue.400' : 'gray.200'}
              borderRadius="md"
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.400' }}
            >
              <input {...getInputProps()} />
              <FiUpload size={24} />
              <Text mt={2}>
                {isDragActive
                  ? 'Drop the photos here'
                  : 'Drag and drop photos here, or click to select'}
              </Text>
            </Box>

            {files.length > 0 && (
              <Text>Selected {files.length} file(s)</Text>
            )}

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for these photos"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <VStack align="stretch" spacing={2}>
                <HStack wrap="wrap" spacing={2}>
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                    </Tag>
                  ))}
                </HStack>
                <Box position="relative">
                  <Input
                    ref={tagInputRef}
                    value={newTag}
                    onChange={(e) => {
                      setNewTag(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Add tags"
                    size="sm"
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <List
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg="white"
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
              </VStack>
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={files.length === 0}
            >
              Upload
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PhotoUploadModal; 