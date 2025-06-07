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
              {photo.tags && photo.tags.length > 0 && (
                <HStack spacing={2} mb={2} wrap="wrap">
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
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PhotoModal; 