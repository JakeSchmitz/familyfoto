import React, { useState } from 'react';
import { Photo } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton, useToast, Box, Image, Text, Flex, Tag, TagLabel, VStack, HStack } from '@chakra-ui/react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  onDelete: () => void;
  currentUserId?: number;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, onDelete, currentUserId }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const imageUrl = photo.gcsUrl || `${API_ENDPOINTS.PHOTOS.BASE}/file/${photo.filename}`;
  const isOwner = currentUserId === photo.user.id;

  console.log('PhotoCard user comparison:', {
    currentUserId,
    photoUserId: photo.user.id,
    isOwner,
    photoId: photo.id,
    photoName: photo.originalName
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the photo modal
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

      onDelete();
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
      <Box
        position="relative"
        cursor="pointer"
        overflow="hidden"
        borderRadius="lg"
        boxShadow="md"
        _hover={{ boxShadow: 'xl' }}
        transition="box-shadow 0.3s"
        onClick={onClick}
        role="group"
      >
        {isOwner && (
          <IconButton
            aria-label="Delete photo"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            position="absolute"
            top={2}
            right={2}
            onClick={handleDeleteClick}
            zIndex={1}
            opacity={0}
            _groupHover={{ opacity: 1 }}
            transition="opacity 0.2s"
          />
        )}
        <Image
          src={imageUrl}
          alt={photo.originalName}
          w="100%"
          h="200px"
          objectFit="cover"
        />
        <Box
          position="absolute"
          inset={0}
          bg="black"
          opacity={0}
          _groupHover={{ opacity: 0.4 }}
          transition="opacity 0.3s"
        >
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={4}
            color="white"
            transform="translateY(100%)"
            _groupHover={{ transform: 'translateY(0)' }}
            transition="transform 0.3s"
            align="stretch"
            spacing={2}
          >
            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
              {photo.originalName}
            </Text>
            {photo.description && (
              <Text fontSize="xs" noOfLines={1}>
                {photo.description}
              </Text>
            )}
            <HStack spacing={1} wrap="wrap">
              {photo.tags.map((tag) => (
                <Tag
                  key={tag.id}
                  size="sm"
                  borderRadius="full"
                  variant="solid"
                  bg="whiteAlpha.200"
                >
                  <TagLabel>{tag.name}</TagLabel>
                </Tag>
              ))}
            </HStack>
            <VStack align="stretch" spacing={0}>
              <Text fontSize="xs">
                Uploaded by: {photo.user.name || photo.user.email}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                {new Date(photo.createdAt).toLocaleDateString()}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Box>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PhotoCard; 