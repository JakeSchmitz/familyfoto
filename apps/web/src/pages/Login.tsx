import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

interface LoginProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = ({ setIsLoggedIn }: LoginProps) => {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    console.log('Google login successful:', credentialResponse);
    // TODO: Send credentialResponse.credential to your backend for verification
    // For now, directly set isLoggedIn to true and navigate
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleGoogleLoginError = () => {
    console.error('Google login failed');
    // Display an error message to the user
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
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  type="standard"
                  theme="outline"
                  size="large"
                  width="480"
                />
              </GoogleOAuthProvider>
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