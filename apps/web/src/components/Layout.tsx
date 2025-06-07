import { Box, Flex, Button, VStack } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadPhotoModal from './UploadPhotoModal';

interface LayoutProps {
  children: ReactNode;
  handleLogout: () => void;
}

const Layout = ({ children, handleLogout }: LayoutProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
        <VStack spacing={4} align="stretch">
          <Button
            colorScheme="blue"
            onClick={() => setIsUploadModalOpen(true)}
            size="lg"
          >
            Upload Photo
          </Button>
        </VStack>

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
      />
    </Flex>
  );
};

export default Layout; 