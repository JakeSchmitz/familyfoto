import { Box, Flex, Heading, Text, VStack, SimpleGrid, Image } from '@chakra-ui/react';

const Home = () => {
  // Placeholder image data for now
  const images = [
    'https://via.placeholder.com/300/F6AD55/FFFFFF?text=Photo+1',
    'https://via.placeholder.com/300/4FD1C5/FFFFFF?text=Photo+2',
    'https://via.placeholder.com/300/63B3ED/FFFFFF?text=Photo+3',
    'https://via.placeholder.com/300/9F7AEA/FFFFFF?text=Photo+4',
    'https://via.placeholder.com/300/F6AD55/FFFFFF?text=Photo+5',
    'https://via.placeholder.com/300/4FD1C5/FFFFFF?text=Photo+6',
  ];

  return (
    <Flex
      direction="column"
      width="100%"
      flex="1" // Ensure the component takes full height provided by parent
    >
      {/* Main Content - Image Viewer */}
      <Box flex="1" p={6} overflowY="auto"> {/* Added p={6} for content padding, overflowY for scrolling */}
        <Heading mb={6} textAlign="center" color="gray.800">Your Photos</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {images.map((src, index) => (
            <Box key={index} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
              <Image src={src} alt={`Photo ${index + 1}`} w="100%" h="200px" objectFit="cover" />
              <Box p="4">
                <Text fontWeight="semibold" fontSize="md">Photo {index + 1}</Text>
                <Text fontSize="sm" color="gray.500">Description of photo {index + 1}</Text>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        py={6}
        px={4}
        bg="gray.50"
        borderTop="1px"
        borderColor="gray.200"
        zIndex={1}
      >
        <Flex justify="center" maxW="container.xl" mx="auto">
          <Text textAlign="center" color="gray.600">
            © {new Date().getFullYear()} FamilyFoto. All rights reserved.
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Home; 