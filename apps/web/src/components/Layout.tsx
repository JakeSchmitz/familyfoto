import { Box, Flex, Button, VStack, Heading, Text, Spinner, Center, Wrap, WrapItem } from '@chakra-ui/react';
import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadPhotoModal from './UploadPhotoModal';

interface LayoutProps {
  children: ReactNode;
  handleLogout: () => void;
  onPhotoUploadSuccess: () => void;
  selectedFilterTags: string[];
  onFilterTagsChange: (tags: string[]) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const Layout = ({ children, handleLogout, onPhotoUploadSuccess, selectedFilterTags, onFilterTagsChange }: LayoutProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        setTagsError(null);
        const response = await fetch(`${API_URL}/api/photos/tags`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { name: string }[] = await response.json();
        setAvailableTags(data.map(tag => tag.name));
      } catch (e: any) {
        setTagsError(`Failed to fetch tags: ${e.message}`);
        console.error("Error fetching tags:", e);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  const handleTagCheckboxChange = (tag: string) => {
    if (selectedFilterTags.includes(tag)) {
      onFilterTagsChange(selectedFilterTags.filter(t => t !== tag));
    } else {
      onFilterTagsChange([...selectedFilterTags, tag]);
    }
  };

  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="gray.50"
        borderRight="1px"
        borderColor="gray.200"
        p={4}
        position="fixed"
        h="100vh"
        display="flex"
        flexDirection="column"
      >
        {/* Top section with upload button */}
        <VStack spacing={4} align="stretch" mb={6}>
          <Button
            colorScheme="blue"
            onClick={() => setIsUploadModalOpen(true)}
            size="lg"
          >
            Upload Photo
          </Button>
        </VStack>

        {/* Tag Filters */}
        <Box mb={6}>
          <Heading size="md" mb={4}>Filter by Tags</Heading>
          {loadingTags && (
            <Center><Spinner size="sm" /></Center>
          )}
          {tagsError && (
            <Text color="red.500">{tagsError}</Text>
          )}
          {!loadingTags && !tagsError && availableTags.length === 0 && (
            <Text fontSize="sm" color="gray.500">No tags available.</Text>
          )}
          {!loadingTags && !tagsError && availableTags.length > 0 && (
            <Wrap spacing={2} justify="center">
              {availableTags.map((tag) => (
                <WrapItem key={tag}>
                  <Button
                    size="sm"
                    variant={selectedFilterTags.includes(tag) ? "solid" : "outline"}
                    colorScheme={selectedFilterTags.includes(tag) ? "blue" : "gray"}
                    onClick={() => handleTagCheckboxChange(tag)}
                  >
                    {tag}
                  </Button>
                </WrapItem>
              ))}
              {selectedFilterTags.length > 0 && (
                <WrapItem w="100%">
                  <Button size="sm" variant="link" onClick={() => onFilterTagsChange([])} mt={2} w="100%">
                    Clear Filters
                  </Button>
                </WrapItem>
              )}
            </Wrap>
          )}
        </Box>

        {/* Bottom section with logout button */}
        <Box mt="auto" pt={4} borderTop="1px" borderColor="gray.200">
          <Button
            variant="ghost"
            colorScheme="red"
            onClick={handleLogout}
            w="100%"
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        ml="250px" // Same as sidebar width
        flex="1"
        p={6}
      >
        {children}
      </Box>

      <UploadPhotoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={onPhotoUploadSuccess}
      />
    </Flex>
  );
};

export default Layout; 