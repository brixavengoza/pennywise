'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Container, Heading, Text, Stack, Link as ChakraLink } from '@chakra-ui/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        if (result.error?.toLowerCase().includes('email')) {
          setError('email', {
            type: 'manual',
            message: result.error || 'Invalid email or password',
          });
        } else if (result.error?.toLowerCase().includes('password')) {
          setError('password', {
            type: 'manual',
            message: result.error || 'Invalid email or password',
          });
        } else {
          setError('root', {
            type: 'manual',
            message: result.error || 'Invalid email or password',
          });
        }
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <Box minH="100vh" bg="bg-primary" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md">
        <Stack gap={8}>
          <Stack gap={2} align="center">
            <Heading size="2xl" color="brand-primary">
              PennyWise
            </Heading>
            <Text color="text-secondary" fontSize="lg">
              Sign in to your account
            </Text>
          </Stack>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={6}>
                {errors.root && (
                  <Box p={3} bg="error" borderRadius="md" color="white" fontSize="sm">
                    {errors.root.message}
                  </Box>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  leftElement={<Mail size={20} />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  leftElement={<Lock size={20} />}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Box display="flex" justifyContent="flex-end">
                  <ChakraLink as={Link} href="/forgot-password" color="brand-primary" fontSize="sm">
                    Forgot password?
                  </ChakraLink>
                </Box>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  loadingText="Signing in..."
                >
                  Sign In
                  <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Button>

                <Stack direction="row" justify="center" gap={1}>
                  <Text color="text-secondary" fontSize="sm">
                    {`Don't have an account?`}
                  </Text>
                  <ChakraLink as={Link} href="/register" color="brand-primary" fontSize="sm">
                    Sign up
                  </ChakraLink>
                </Stack>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
