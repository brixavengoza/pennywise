'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Box, Container, Heading, Text, Stack, Link as ChakraLink } from '@chakra-ui/react';
import { Button, Input, Card } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import Link from 'next/link';
import { toaster } from '@/components/ui/toaster';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = result.error || 'Failed to create account';
        
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already exists')) {
          setError('email', {
            type: 'manual',
            message: 'Email already exists',
          });
        } else {
          setError('root', {
            type: 'manual',
            message: errorMessage,
          });
        }
        setIsSubmitting(false);
        return;
      }

      toaster.create({
        title: 'Account Created',
        description: 'Your account has been successfully created. You are now logged in.',
        type: 'success',
      });

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/');
      } else {
        router.push('/login');
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
              Create your account
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
                  label="Name (Optional)"
                  type="text"
                  placeholder="Enter your name"
                  leftElement={<User size={20} />}
                  error={errors.name?.message}
                  {...register('name')}
                />

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

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  leftElement={<Lock size={20} />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  loadingText="Creating account..."
                >
                  Create Account
                  <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Button>

                <Stack direction="row" justify="center" gap={1}>
                  <Text color="text-secondary" fontSize="sm">
                    Already have an account?
                  </Text>
                  <ChakraLink as={Link} href="/login" color="brand-primary" fontWeight="semibold" fontSize="sm">
                    Sign in
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
