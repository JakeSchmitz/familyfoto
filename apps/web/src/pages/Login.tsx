import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';

interface LoginProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const Login = ({ setIsLoggedIn }: LoginProps) => {
  const navigate = useNavigate();

  const handleMockLogin = async () => {
    try {
      // Mock successful login response
      const mockResponse = {
        credential: 'mock-credential-token',
        clientId: 'mock-client-id',
        select_by: 'user'
      };
      
      console.log('Mock login successful:', mockResponse);
      setIsLoggedIn(true); // Set logged in status to true
      // TODO: Replace with actual backend call when ready
      // For now, just navigate to home
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Flex
      direction="column"
      width="100%"
      minH="100vh"
      bgImage="url('/BaickerSibs.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)', // Dark overlay
      }}
    >
      {/* Main Content */}
      <Flex flex="1" align="center" justify="center" zIndex={1}>
        <VStack spacing={8} align="center" justify="center" w="100%">
          <Heading size="2xl" textAlign="center" color="white">
            Welcome to FamilyFoto
          </Heading>
          <Box
            p={8}
            borderWidth={1}
            borderRadius={8}
            boxShadow="lg"
            w="100%"
            maxW="480px"
            bg="white"
          >
            <VStack spacing={6}>
              <Heading size="md" textAlign="center">Sign in to continue</Heading>
              <Button
                colorScheme="blue"
                onClick={handleMockLogin}
                size="lg"
                w="100%"
                leftIcon={<Box as="span" className="google-icon">G</Box>}
              >
                Sign in with Google (Mock)
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Flex>

      {/* Footer */}
      <Box
        as="footer"
        py={6}
        px={4}
        bg="rgba(0, 0, 0, 0.7)"
        borderTop="1px"
        borderColor="whiteAlpha.300"
        zIndex={1}
      >
        <Flex justify="center" maxW="container.xl" mx="auto">
          <Text textAlign="center" color="whiteAlpha.800">
            © {new Date().getFullYear()} FamilyFoto. All rights reserved.
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Login; 