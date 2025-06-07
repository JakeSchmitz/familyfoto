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
  HStack,
} from '@chakra-ui/react';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: {
    url: string;
    description: string;
    tags: string[];
    timestamp: string;
  } | null;
}

const PhotoModal = ({ isOpen, onClose, photo }: PhotoModalProps) => {
  if (!photo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="black" maxW="100vw" maxH="100vh" m={0}>
        <ModalCloseButton color="white" zIndex={1000} />
        <ModalBody p={0} display="flex" flexDirection="column">
          <Box flex="1" position="relative" display="flex" alignItems="center" justifyContent="center">
            <Image
              src={photo.url}
              alt={photo.description || 'Photo'}
              maxH="calc(100vh - 80px)"
              maxW="100%"
              objectFit="contain"
            />
          </Box>
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="rgba(0, 0, 0, 0.7)"
            p={4}
            color="white"
          >
            {photo.description && (
              <Text fontSize="lg" mb={2}>
                {photo.description}
              </Text>
            )}
            {photo.tags && photo.tags.length > 0 && (
              <HStack spacing={2} mb={2}>
                {photo.tags.map((tag) => (
                  <Tag key={tag} size="sm" variant="solid" colorScheme="blue">
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            )}
            <Text fontSize="sm" color="gray.300">
              Uploaded: {new Date(photo.timestamp).toLocaleString()}
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PhotoModal; 