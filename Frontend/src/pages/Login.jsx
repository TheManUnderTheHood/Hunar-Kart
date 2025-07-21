import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormError from '../components/ui/FormError';
import { Gem } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
      resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError("root", {
          type: "manual",
          message: err.message || "An unknown error occurred",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
        <div className="relative w-full max-w-md space-y-8 rounded-xl bg-card/80 p-8 shadow-xl backdrop-blur-sm border border-border">
          <div>
            <Gem className="mx-auto h-12 w-auto text-primary"/>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
              Sign in to HunarKart Admin
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <Input id="email-address" type="email" autoComplete="email" placeholder="Email address" {...register("email")} />
                <FormError message={errors.email?.message} />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <Input id="password" type="password" autoComplete="current-password" placeholder="Password" {...register("password")} />
                <FormError message={errors.password?.message} />
              </div>
            </div>
            <FormError message={errors.root?.message} />
            <div>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Sign in
              </Button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default Login;