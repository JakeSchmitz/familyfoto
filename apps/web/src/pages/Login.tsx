import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      await login(data.token, data.user);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
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
      <Flex flex="1" align="flex-start" justify="center" pt="10vh" zIndex={1}>
        <VStack spacing={8} align="center" justify="center" w="100%" maxW="container.sm">
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
              {error && <Text color="red.500">{error}</Text>}
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => setError('Google login failed')}
                type="standard"
                theme="outline"
                size="large"
                width="480"
              />
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
        borderTop="1"
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