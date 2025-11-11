      import { useForm } from 'react-hook-form';
      import { zodResolver } from '@hookform/resolvers/zod';
      import * as z from 'zod';
      import useAuth from '../hooks/useAuth';
      import Button from '../components/ui/Button';
      import Input from '../components/ui/Input';
      import FormError from '../components/ui/FormError';
      import { Gem, Mail, Lock, Sparkles, Shield } from 'lucide-react';

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
          <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5">
              {/* Floating orbs */}
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
            </div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full blur-xl"></div>
              
              <div className="relative space-y-8 rounded-2xl bg-card/95 dark:bg-card/90 p-8 shadow-2xl backdrop-blur-xl border border-border/50 overflow-hidden">
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-[1px] rounded-2xl bg-card/95 dark:bg-card/90"></div>
                </div>
                
                {/* Header section */}
                <div className="relative z-10 text-center">
                  {/* Enhanced logo */}
                  <div className="relative mx-auto w-fit mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                    <div className="relative p-4 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg">
                      <Gem className="h-10 w-10 text-white" />
                    </div>
                    {/* Sparkle effects */}
                    <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
                    <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-primary/60 animate-pulse" style={{animationDelay: '1s'}} />
                  </div>

                  {/* Enhanced title */}
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-text-primary via-primary to-text-primary bg-clip-text text-transparent mb-2">
                    Welcome
                  </h2>
                  <p className="text-text-secondary flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sign in to Hunar-Kart Portal
                  </p>
                </div>

                {/* Form section */}
                <form className="relative z-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Enhanced input fields */}
                  <div className="space-y-4">
                    <div className="group">
                      <label htmlFor="email-address" className="block text-sm font-medium text-text-secondary mb-2 group-focus-within:text-primary transition-colors">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="email-address" 
                          type="email" 
                          autoComplete="email" 
                          placeholder="Enter your email" 
                          className="pl-10 transition-all duration-200 focus:shadow-lg focus:shadow-primary/20 focus:scale-[1.02]"
                          {...register("email")} 
                        />
                      </div>
                      <FormError message={errors.email?.message} />
                    </div>

                    <div className="group">
                      <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2 group-focus-within:text-primary transition-colors">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="password" 
                          type="password" 
                          autoComplete="current-password" 
                          placeholder="Enter your password"
                          className="pl-10 transition-all duration-200 focus:shadow-lg focus:shadow-primary/20 focus:scale-[1.02]"
                          {...register("password")} 
                        />
                      </div>
                      <FormError message={errors.password?.message} />
                    </div>
                  </div>

                  {/* Global error */}
                  <FormError message={errors.root?.message} />

                  {/* Enhanced submit button */}
                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]" 
                      loading={isSubmitting}
                    >
                      {isSubmitting ? "Signing you in..." : "Sign In"}
                    </Button>
                  </div>
                </form>

                {/* Decorative bottom section */}
                <div className="relative z-10 pt-6 border-t border-border/30">
                  <div className="flex items-center justify-center gap-2 text-xs text-text-secondary/60">
                    <Shield className="h-3 w-3" />
                    <span>Secure admin access</span>
                  </div>
                </div>

                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full opacity-60 animate-ping"></div>
                  <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-primary/60 rounded-full opacity-40 animate-ping" style={{animationDelay: '2s'}}></div>
                  <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-primary/80 rounded-full opacity-50 animate-ping" style={{animationDelay: '4s'}}></div>
                </div>
              </div>

              {/* Bottom decoration */}
              <div className="mt-8 text-center text-xs text-text-secondary/50">
                © 2024 HunarKart. Crafted with care for artisans.
              </div>
            </div>
          </div>
        );
      };

      export default Login;