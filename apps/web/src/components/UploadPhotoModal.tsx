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
  Select,
  Box,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadPhotoModal = ({ isOpen, onClose }: UploadPhotoModalProps) => {
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(selectedTags));

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
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
            >
              <input {...getInputProps()} />
              {file ? (
                <Text>{file.name}</Text>
              ) : (
                <Text>
                  {isDragActive
                    ? "Drop the photo here"
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
              <Select
                placeholder="Select tags"
                value=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !selectedTags.includes(value)) {
                    setSelectedTags([...selectedTags, value]);
                  }
                }}
              >
                <option value="family">Family</option>
                <option value="vacation">Vacation</option>
                <option value="birthday">Birthday</option>
                <option value="holiday">Holiday</option>
              </Select>
              {selectedTags.length > 0 && (
                <Box mt={2}>
                  {selectedTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      mr={2}
                      mb={2}
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                    >
                      {tag} ×
                    </Button>
                  ))}
                </Box>
              )}
            </FormControl>

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