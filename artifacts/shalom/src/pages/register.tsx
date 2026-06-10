import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Calendar, MapPin, Sparkles } from "lucide-react";
import { useCreateRegistration } from "@workspace/api-client-react";
import shalomLogo from "@assets/logo_1778697155106.png";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { Checkbox } from "@/components/ui/checkbox";

const VOLUNTEER_ROLES = [
  "Media",
  "Ushers",
  "Protocol",
  "Parking",
  "Welcome Team",
  "Setup Crew",
  "Clean Up Crew",
  "Child Care Crew",
  "Merch Crew",
] as const;

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  conferenceYear: z.number().default(2026),
  volunteer: z.boolean().default(false),
  volunteerRole: z.string().optional(),
}).refine(
  (d) => !d.volunteer || !!d.volunteerRole,
  { message: "Please select a volunteer role", path: ["volunteerRole"] }
);

type RegistrationInput = z.infer<typeof registrationSchema>;

export default function Register() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const createRegistration = useCreateRegistration();

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      conferenceYear: 2026,
      volunteer: false,
      volunteerRole: "",
    },
  });

  const isVolunteer = form.watch("volunteer");

  const onSubmit = (data: RegistrationInput) => {
    createRegistration.mutate(
      { data },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: any) => {
          if (error.status === 409) {
            toast({
              title: "Already Registered",
              description: "This email is already registered for Shalom 2026.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registration Failed",
              description: error.data?.error || "Something went wrong. Please try again.",
              variant: "destructive",
            });
          }
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <div className="space-y-4">
            <h1
              className="text-4xl font-bold italic text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Thank You!
            </h1>
            <p className="text-white/70 text-lg">
              Your registration for Shalom 2026 is confirmed. We can't wait to worship with you.
            </p>
          </div>
          <Button asChild className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest border-none">
            <Link href="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative pb-20">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <SiteHeader />

      <main className="container relative z-10 mx-auto max-w-2xl px-4 mt-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <img src={shalomLogo} alt="SHALOM" className="h-16 w-auto" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl font-bold uppercase italic text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Register
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 backdrop-blur-sm text-sm font-bold">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-white/90">Oct 9-10, 2026</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 backdrop-blur-sm text-sm font-bold">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-white/90">Windsor Mill, MD</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 backdrop-blur-sm text-sm font-bold">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-white/90">John 14:26-27</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                          data-testid="input-firstName"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                          data-testid="input-lastName"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field: { value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Phone Number (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        value={value ?? ""}
                        {...rest}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volunteer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) form.setValue("volunteerRole", "");
                        }}
                        className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-testid="checkbox-volunteer"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-white font-bold text-base cursor-pointer">
                        I would like to volunteer
                      </FormLabel>
                      <p className="text-white/50 text-sm">
                        Help us make Shalom 2026 an unforgettable experience. We'll reach out with details.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {isVolunteer && (
                <FormField
                  control={form.control}
                  name="volunteerRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                        Volunteer Role
                      </FormLabel>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {VOLUNTEER_ROLES.map((role) => {
                          const selected = field.value === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => field.onChange(role)}
                              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border transition-all ${
                                selected
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white/5 border-white/10 text-white/60 hover:border-primary/50 hover:text-white"
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                disabled={createRegistration.isPending}
                className="w-full h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-xl font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] transition-all border-none mt-4"
                data-testid="button-submit"
              >
                {createRegistration.isPending ? (
                  "Registering..."
                ) : (
                  <>
                    Confirm Registration <ArrowRight className="ml-2 h-6 w-6" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}
