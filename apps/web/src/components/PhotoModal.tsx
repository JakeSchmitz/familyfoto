import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Box,
  Tag,
  TagLabel,
  HStack,
  VStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Photo } from '../types';
import { API_ENDPOINTS } from '../config/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  currentUserId?: number;
  onDelete?: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, currentUserId, onDelete }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const imageUrl = photo.gcsUrl || `${API_ENDPOINTS.PHOTOS.BASE}/file/${photo.filename}`;
  const isOwner = currentUserId === photo.user.id;

  console.log('PhotoModal user comparison:', {
    currentUserId,
    photoUserId: photo.user.id,
    isOwner,
    photoId: photo.id,
    photoName: photo.originalName
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PHOTOS.BASE}/${photo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      toast({
        title: 'Photo deleted',
        status: 'success',
        duration: 3000,
      });

      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: 'Error deleting photo',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" alignItems="center" justifyContent="space-between">
            <Text>{photo.originalName}</Text>
            {isOwner && (
              <IconButton
                aria-label="Delete photo"
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                onClick={handleDeleteClick}
              />
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Image
                src={imageUrl}
                alt={photo.originalName}
                borderRadius="md"
                maxH="70vh"
                objectFit="contain"
              />
              {photo.description && (
                <Text fontSize="md">{photo.description}</Text>
              )}
              {photo.tags && photo.tags.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Tags:
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    {photo.tags.map((tag) => (
                      <Tag key={tag.id} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                        <TagLabel>{tag.name}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              )}
              <Text fontSize="sm" color="gray.500">
                Uploaded by: {photo.user.name || photo.user.email}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Uploaded on: {new Date(photo.createdAt).toLocaleDateString()}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PhotoModal; 