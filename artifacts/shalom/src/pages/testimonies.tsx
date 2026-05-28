import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { useCreateTestimony } from "@workspace/api-client-react";
import shalomLogo from "@assets/logo_1778697155106.png";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const testimonySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  conferenceYear: z.number().default(2026),
  testimony: z.string().min(10, "Please share at least a few words"),
});

type TestimonyInput = z.infer<typeof testimonySchema>;

export default function Testimonies() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const createTestimony = useCreateTestimony();

  const form = useForm<TestimonyInput>({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      name: "",
      email: "",
      conferenceYear: 2026,
      testimony: "",
    },
  });

  const onSubmit = (data: TestimonyInput) => {
    createTestimony.mutate(
      { data },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: any) => {
          toast({
            title: "Submission Failed",
            description: error.data?.error || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleReset = () => {
    form.reset();
    setIsSuccess(false);
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
              Your testimony has been shared. Thank you for telling us what God did at Shalom.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleReset}
              className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest border-none"
            >
              Share Another
            </Button>
            <Button asChild variant="ghost" className="w-full text-white/50 hover:text-white">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
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

      <header className="relative z-20 px-4 py-6 sm:px-6">
        <div className="container mx-auto max-w-7xl flex items-center">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
        </div>
      </header>

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
            Your Testimony
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg mb-8"
          >
            Share what God did at Shalom
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="conferenceYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Conference Year
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-white/20 focus:ring-primary/20"
                          data-testid="select-year"
                        >
                          <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-white/10 text-white">
                        {[2026, 2025, 2024, 2023, 2022, 2021, 2019].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testimony"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/50 uppercase tracking-widest text-xs font-bold">
                      Testimony
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your story..."
                        {...field}
                        className="bg-white/5 border-white/10 h-40 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
                        data-testid="textarea-testimony"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createTestimony.isPending}
                className="w-full h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-xl font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] transition-all border-none mt-4"
                data-testid="button-submit"
              >
                {createTestimony.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Testimony <MessageSquare className="ml-2 h-6 w-6" />
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
