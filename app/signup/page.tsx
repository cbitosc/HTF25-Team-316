'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, GraduationCap, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Weak',
    color: 'bg-red-500',
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    display_name: '',
    role: 'student' as 'student' | 'teacher',
    student_id: '',
    grade: '',
    teacher_id: '',
    department: '',
  });

  // Prefill email/name from query params if coming from Google login
  const presetEmail = searchParams?.get('email') || '';
  const presetName = searchParams?.get('name') || '';
  
  // Apply presets once if fields are empty
  useEffect(() => {
    if ((presetEmail || presetName) && (!formData.email || !formData.display_name)) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || presetEmail,
        display_name: prev.display_name || presetName,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetEmail, presetName]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    let label = 'Weak';
    let color = 'bg-red-500';
    
    if (score >= 80) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 60) {
      label = 'Good';
      color = 'bg-yellow-500';
    } else if (score >= 40) {
      label = 'Fair';
      color = 'bg-orange-500';
    }
    
    return { score, label, color };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Update password strength on password change
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    setError('');
  };

  const handleRoleChange = (value: 'student' | 'teacher') => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.display_name) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.role === 'student' && !formData.grade) {
      setError('Please select your grade');
      return false;
    }
    
    if (formData.role === 'teacher' && !formData.department) {
      setError('Please enter your department');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Register with backend (Firebase creation is handled in useAuth hook)
      const userData = {
        email: formData.email,
        password: formData.password,
        display_name: formData.display_name,
        role: formData.role,
        ...(formData.role === 'student' && {
          student_id: formData.student_id || `STU${Date.now()}`,
          grade: formData.grade,
        }),
        ...(formData.role === 'teacher' && {
          teacher_id: formData.teacher_id || `TCH${Date.now()}`,
          department: formData.department,
        }),
      };

      await register(userData);
      
      // Redirect based on role
      if (formData.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please use the login page.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password (minimum 6 characters)');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    
    // Validate role selection before Google sign-up
    if (!formData.role) {
      setError('Please select your role (Student or Teacher) before signing up with Google');
      return;
    }
    
    if (formData.role === 'student' && !formData.grade) {
      setError('Please select your grade before signing up with Google');
      return;
    }
    
    if (formData.role === 'teacher' && !formData.department) {
      setError('Please enter your department before signing up with Google');
      return;
    }
    
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Now call our unified register which will detect currentUser and use its idToken
      const userData = {
        email: result.user.email!,
        display_name: result.user.displayName || result.user.email!.split('@')[0],
        role: formData.role,
        ...(formData.role === 'student' && {
          student_id: formData.student_id || `STU${Date.now()}`,
          grade: formData.grade,
        }),
        ...(formData.role === 'teacher' && {
          teacher_id: formData.teacher_id || `TCH${Date.now()}`,
          department: formData.department,
        }),
      } as any;

      await register(userData);
      
      // Redirect based on role
      if (formData.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled. Please try again.');
      } else if (err.message && err.message.includes('already registered')) {
        setError('This Google account is already registered. Please use the login page.');
      } else {
        setError('Failed to sign up with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            EduDash
          </h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>Join EduDash and start your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'student'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    disabled={isLoading}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Student</div>
                      <div className="text-xs text-muted-foreground">Learn and grow</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'teacher'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    disabled={isLoading}
                  >
                    <BookOpen className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Teacher</div>
                      <div className="text-xs text-muted-foreground">Educate and inspire</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="display_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="display_name"
                      name="display_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.display_name}
                      onChange={handleChange}
                      className="pl-9"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-9 pr-9"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.score >= 80 ? 'text-green-600' :
                          passwordStrength.score >= 60 ? 'text-yellow-600' :
                          passwordStrength.score >= 40 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.score} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-9 pr-9"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-1 text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Conditional Fields based on Role */}
                {formData.role === 'student' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID (Optional)</Label>
                      <Input
                        id="student_id"
                        name="student_id"
                        type="text"
                        placeholder="STU12345"
                        value={formData.student_id}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade/Class *</Label>
                      <Select
                        value={formData.grade}
                        onValueChange={(value) => setFormData({ ...formData, grade: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {['6', '7', '8', '9', '10', '11', '12', 'Undergraduate', 'Graduate'].map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="teacher_id">Teacher ID (Optional)</Label>
                      <Input
                        id="teacher_id"
                        name="teacher_id"
                        type="text"
                        placeholder="TCH12345"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g., Mathematics"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
