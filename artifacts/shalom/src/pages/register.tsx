import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle2, MapPin, Sparkles, Upload, X } from "lucide-react";
import {
  useCreateRegistration,
  useRequestExistingRegistrationBadge,
  useRequestRegistrationBadgeUploadUrl,
  useCompleteRegistrationBadge,
  useSkipRegistrationBadge
} from "@workspace/api-client-react";
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
  hasPlusOne: z.boolean().default(false),
  plusOne: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().optional(),
  }).optional(),
  wantsAttendeeBadge: z.boolean().default(false),
  portraitFile: z.any().optional(),
}).refine(
  (d) => !d.volunteer || !!d.volunteerRole,
  { message: "Please select a volunteer role", path: ["volunteerRole"] }
).refine(
  (d) => !d.hasPlusOne || !!d.plusOne,
  { message: "Please add your plus one’s details", path: ["plusOne"] }
).refine(
  (d) => {
    if (d.wantsAttendeeBadge && !d.portraitFile) return false;
    return true;
  },
  { message: "Please select a portrait photo for your badge", path: ["portraitFile"] }
).refine(
  (d) => {
    if (d.wantsAttendeeBadge && d.portraitFile) {
      const file = d.portraitFile as File;
      if (file.size > 5 * 1024 * 1024) return false;
    }
    return true;
  },
  { message: "Photo must be less than 5MB", path: ["portraitFile"] }
).refine(
  (d) => {
    if (d.wantsAttendeeBadge && d.portraitFile) {
      const file = d.portraitFile as File;
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return false;
    }
    return true;
  },
  { message: "Photo must be JPG, PNG, or WebP", path: ["portraitFile"] }
);

type RegistrationInput = z.infer<typeof registrationSchema>;
type SubmitStage = "idle" | "registering" | "requesting" | "preparing" | "uploading" | "finishing";

const STAGE_MESSAGES: Record<SubmitStage, string> = {
  idle: "Confirm Registration",
  registering: "Securing your spot...",
  requesting: "Finding your registration...",
  preparing: "Preparing badge...",
  uploading: "Uploading photo...",
  finishing: "Finalizing details...",
};

const existingBadgeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
});

type ExistingBadgeInput = z.infer<typeof existingBadgeSchema>;

function getPortraitValidationMessage(file: File): string | null {
  if (file.size > 5 * 1024 * 1024) return "Photo must be less than 5MB";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Photo must be JPG, PNG, or WebP";
  }
  return null;
}

const labelClass = "text-white/50 uppercase tracking-widest text-[10px] font-bold mb-2 block";
const inputClass = "bg-transparent border-0 border-b border-white/20 rounded-none px-0 h-12 text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white transition-colors w-full";

function PortraitUpload({ value, onChange }: { value?: File; onChange: (f?: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
    return undefined;
  }, [value]);

  const handleFile = (file?: File) => {
    if (file) {
      onChange(file);
    }
  };

  return (
    <div
      className={`group relative flex aspect-[3/4] w-full max-w-[200px] flex-col items-center justify-center overflow-hidden border transition-colors ${
        isDragging
          ? "border-white bg-white/5"
          : value
          ? "border-white/20 bg-transparent"
          : "border-white/10 bg-transparent hover:border-white/30"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        aria-label="Upload portrait photo"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative group/preview"
          >
            <img src={preview} alt="Portrait preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(undefined);
                }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                aria-label="Remove photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 cursor-pointer p-6 text-center w-full h-full justify-center"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
            <div>
              <p className="text-white/80 text-sm font-medium">Upload Photo</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-2">JPG, PNG, WebP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExistingRegistrationBadge() {
  const [portraitFile, setPortraitFile] = useState<File>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");
  const { toast } = useToast();
  const requestExistingBadge = useRequestExistingRegistrationBadge();
  const requestUploadUrl = useRequestRegistrationBadgeUploadUrl();
  const completeBadge = useCompleteRegistrationBadge();
  const skipBadge = useSkipRegistrationBadge();
  
  const form = useForm<ExistingBadgeInput>({
    resolver: zodResolver(existingBadgeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const isLoading = submitStage !== "idle";

  const onSubmit = async (data: ExistingBadgeInput) => {
    if (!portraitFile) {
      toast({
        title: "Portrait photo required",
        description: "Please select a portrait photo for your badge.",
        variant: "destructive",
      });
      return;
    }

    const portraitError = getPortraitValidationMessage(portraitFile);
    if (portraitError) {
      toast({
        title: "Invalid portrait photo",
        description: portraitError,
        variant: "destructive",
      });
      return;
    }

    let access: { registrationId: number; badgeUploadToken: string } | undefined;
    try {
      setSubmitStage("requesting");
      access = await requestExistingBadge.mutateAsync({
        data: {
          ...data,
          conferenceYear: 2026,
        },
      });

      setSubmitStage("preparing");
      const uploadUrlRes = await requestUploadUrl.mutateAsync({
        registrationId: access.registrationId,
        data: {
          token: access.badgeUploadToken,
          name: portraitFile.name,
          size: portraitFile.size,
          contentType: portraitFile.type as "image/jpeg" | "image/png" | "image/webp",
        },
      });

      setSubmitStage("uploading");
      const putRes = await fetch(uploadUrlRes.uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": portraitFile.type,
        },
        body: portraitFile,
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed with status: ${putRes.status}`);
      }

      setSubmitStage("finishing");
      const completion = await completeBadge.mutateAsync({
        registrationId: access.registrationId,
        data: {
          token: access.badgeUploadToken,
          objectPath: uploadUrlRes.objectPath,
        },
      });

      if (completion.badgeDeliveryStatus !== "delivered") {
        throw new Error("Badge delivery was not completed");
      }

      setIsSuccess(true);
    } catch (error: any) {
      if (access) {
        await skipBadge.mutateAsync({
          registrationId: access.registrationId,
          data: { token: access.badgeUploadToken },
        }).catch(() => undefined);
      }
      setSubmitStage("idle");

      if (error?.status === 404) {
        toast({
          title: "Registration not found",
          description: "Use the same first name, last name, and email address from your Shalom 2026 registration.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Badge Creation Failed",
          description: "We couldn't create your badge right now. Please check your photo and try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto max-w-3xl px-6 py-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-12"
          >
            <div className="border border-white/10 p-8 sm:p-16 space-y-8 relative overflow-hidden bg-white/5">
              <CheckCircle2 className="h-10 w-10 text-white" />
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold uppercase text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Your Badge Is On Its Way
                </h1>
                <p className="text-white/60 text-lg leading-relaxed max-w-xl">
                  Your personalized “I’m Attending” badge has been created and sent to your registration email.
                </p>
              </div>
            </div>
            <div>
              <Button asChild className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-none font-bold uppercase tracking-widest text-sm">
                <Link href="/2026">Back to Shalom 2026</Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black flex flex-col pb-20">
      <SiteHeader />

      <main className="flex-1 container mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50"
          >
            Already registered for Shalom 2026?
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold uppercase text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create Your Badge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl text-white/60 text-lg leading-relaxed"
          >
            Enter the same details you used to register, upload a portrait, and we’ll email you a personalized “I’m Attending” badge.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
              <div className="space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                  01. Verification Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            {...field}
                            className={inputClass}
                            data-testid="input-badge-firstName"
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
                        <FormLabel className={labelClass}>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            className={inputClass}
                            data-testid="input-badge-lastName"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Registration Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                              className={inputClass}
                              data-testid="input-badge-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                  02. Badge Photo
                </h2>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <PortraitUpload value={portraitFile} onChange={setPortraitFile} />
                  <div className="text-sm text-white/50 max-w-xs space-y-2 pt-2">
                    <p>Please provide a clear portrait photo.</p>
                    <p>This image will be used to generate your official attendee badge.</p>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mt-6 block">Requirements</p>
                    <p className="text-white/40 text-xs">Max size: 5MB<br/>Formats: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex flex-col-reverse sm:flex-row gap-6 items-center justify-between">
                <Button asChild type="button" variant="ghost" className="text-white/60 hover:bg-transparent hover:text-white rounded-none px-0 w-full sm:w-auto justify-start">
                  <Link href="/2026">← Back to Conference Details</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-14 px-10 bg-white text-black hover:bg-white/90 rounded-none font-bold uppercase tracking-widest text-sm"
                  data-testid="button-create-badge"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>{STAGE_MESSAGES[submitStage]}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Create My Badge
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}

function RegistrationForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [badgeDelivered, setBadgeDelivered] = useState(false);
  const [registeredPlusOne, setRegisteredPlusOne] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");

  const { toast } = useToast();

  const createRegistration = useCreateRegistration();
  const requestUploadUrl = useRequestRegistrationBadgeUploadUrl();
  const completeBadge = useCompleteRegistrationBadge();
  const skipBadge = useSkipRegistrationBadge();

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
      hasPlusOne: false,
      plusOne: undefined,
      wantsAttendeeBadge: false,
      portraitFile: undefined,
    },
  });

  const isVolunteer = form.watch("volunteer");
  const hasPlusOne = form.watch("hasPlusOne");
  const wantsBadge = form.watch("wantsAttendeeBadge");
  const isLoading = submitStage !== "idle";

  const onSubmit = async (data: RegistrationInput) => {
    try {
      setSubmitStage("registering");

      const regData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        conferenceYear: data.conferenceYear,
        volunteer: data.volunteer,
        volunteerRole: data.volunteerRole || undefined,
        plusOne: data.hasPlusOne && data.plusOne
          ? {
              firstName: data.plusOne.firstName,
              lastName: data.plusOne.lastName,
              email: data.plusOne.email,
              phone: data.plusOne.phone || undefined,
            }
          : undefined,
        wantsAttendeeBadge: data.wantsAttendeeBadge,
      };

      const created = await createRegistration.mutateAsync({ data: regData });

      let delivered = false;

      if (data.wantsAttendeeBadge && data.portraitFile && created.badgeUploadToken) {
        const file = data.portraitFile as File;
        try {
          setSubmitStage("preparing");
          const uploadUrlRes = await requestUploadUrl.mutateAsync({
            registrationId: created.id,
            data: {
              token: created.badgeUploadToken,
              name: file.name,
              size: file.size,
              contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
            },
          });

          setSubmitStage("uploading");
          const putRes = await fetch(uploadUrlRes.uploadURL, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!putRes.ok) {
            throw new Error(`Upload failed with status: ${putRes.status}`);
          }

          setSubmitStage("finishing");
          const completion = await completeBadge.mutateAsync({
            registrationId: created.id,
            data: {
              token: created.badgeUploadToken,
              objectPath: uploadUrlRes.objectPath,
            },
          });
          delivered = completion.badgeDeliveryStatus === "delivered";
        } catch (err: any) {
          await skipBadge.mutateAsync({
            registrationId: created.id,
            data: {
              token: created.badgeUploadToken,
            },
          });
          toast({
            title: "Badge Generation Failed",
            description: "We registered you successfully, but there was an issue generating your badge. Your standard confirmation email has been sent.",
            variant: "destructive",
          });
        }
      }

      setBadgeDelivered(delivered);
      setRegisteredPlusOne(data.hasPlusOne);
      setIsSuccess(true);
    } catch (error: any) {
      setSubmitStage("idle");
      if (error.status === 409) {
        toast({
          title: "Already Registered",
          description: error.data?.error || "One of these attendees is already registered for Shalom 2026.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: error.data?.error || error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto max-w-3xl px-6 py-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-12"
          >
            <div className="border border-white/10 p-8 sm:p-16 space-y-8 relative overflow-hidden bg-white/5">
              <CheckCircle2 className="h-10 w-10 text-white" />
              <div>
                <h1
                  className="text-4xl sm:text-5xl font-bold uppercase text-white mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Thank You
                </h1>
                <p className="text-white/60 text-lg leading-relaxed max-w-xl">
                  Your registration{registeredPlusOne ? " and your plus one’s registration" : ""} for Shalom 2026 is confirmed. We look forward to worshipping with you.
                </p>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm leading-relaxed max-w-xl">
                  {registeredPlusOne
                    ? `Confirmation emails have been sent to both attendees${badgeDelivered ? ", including your personalized badge" : ""}.`
                    : badgeDelivered
                    ? "Your confirmation email with your personalized badge attached has been sent."
                    : "Your confirmation email has been sent."}
                </p>
              </div>
            </div>
            <div>
              <Button asChild className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-none font-bold uppercase tracking-widest text-sm">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black flex flex-col pb-20">
      <SiteHeader />

      <main className="flex-1 container mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/50"
          >
            Shalom 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold uppercase text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Register
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 grid border-y border-white/10 sm:grid-cols-3"
          >
            <div className="flex items-center gap-3 border-b border-white/10 py-4 sm:border-b-0 sm:border-r sm:pr-5">
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium text-white/80">Oct 9–10, 2026</span>
            </div>
            <div className="flex items-center gap-3 border-b border-white/10 py-4 sm:border-b-0 sm:border-r sm:px-5">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium text-white/80">Windsor Mill, MD</span>
            </div>
            <div className="flex items-center gap-3 py-4 sm:pl-5">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium text-white/80">John 14:26–27</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
              
              {/* Section: Personal Details */}
              <div className="space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                  01. Personal Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className={inputClass} data-testid="input-firstName" />
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
                        <FormLabel className={labelClass}>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className={inputClass} data-testid="input-lastName" />
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
                        <FormLabel className={labelClass}>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className={inputClass} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 000-0000" {...field} className={inputClass} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section: Volunteer */}
              <div className="space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                  02. Volunteer
                </h2>
                <FormField
                  control={form.control}
                  name="volunteer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 border border-white/10 hover:border-white/30 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded-none border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1.5 leading-none">
                        <FormLabel className="text-sm font-medium text-white cursor-pointer block">
                          I would like to volunteer
                        </FormLabel>
                        <p className="text-sm text-white/50">
                          Help us make Shalom 2026 an unforgettable experience. We'll reach out with details.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {isVolunteer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-2">
                        <FormField
                          control={form.control}
                          name="volunteerRole"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className={labelClass}>Select a Role</FormLabel>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {VOLUNTEER_ROLES.map((role) => (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => field.onChange(role)}
                                    className={`px-4 py-3 text-sm font-medium border text-left transition-colors ${
                                      field.value === role
                                        ? "border-white bg-white text-black"
                                        : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                    }`}
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section: Plus One */}
              <div className="space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                  03. Plus One
                </h2>
                <FormField
                  control={form.control}
                  name="hasPlusOne"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 border border-white/10 hover:border-white/30 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded-none border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1.5 leading-none">
                        <FormLabel className="text-sm font-medium text-white cursor-pointer block">
                          I’m registering a plus one
                        </FormLabel>
                        <p className="text-sm text-white/50">
                          Add one additional attendee to your registration.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {hasPlusOne && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                        <FormField
                          control={form.control}
                          name="plusOne.firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelClass}>Guest First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane" {...field} className={inputClass} data-testid="input-plusOne-firstName" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plusOne.lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelClass}>Guest Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} className={inputClass} data-testid="input-plusOne-lastName" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plusOne.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelClass}>Guest Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jane@example.com" {...field} className={inputClass} data-testid="input-plusOne-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plusOne.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelClass}>Guest Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="+1 (555) 000-0000" {...field} className={inputClass} data-testid="input-plusOne-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section: Badge */}
              <div className="space-y-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                  04. Attendee Badge
                </h2>
                <FormField
                  control={form.control}
                  name="wantsAttendeeBadge"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 border border-white/10 hover:border-white/30 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded-none border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1.5 leading-none">
                        <FormLabel className="text-sm font-medium text-white cursor-pointer block">
                          I want a personalized "I'm Attending" badge
                        </FormLabel>
                        <p className="text-sm text-white/50">
                          Receive a custom digital badge with your portrait to share with friends.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {wantsBadge && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 pb-2 flex flex-col sm:flex-row gap-8 items-start">
                        <PortraitUpload
                          value={form.watch("portraitFile")}
                          onChange={(file) => form.setValue("portraitFile", file, { shouldValidate: true })}
                        />
                        <div className="text-sm text-white/50 max-w-xs space-y-2 pt-2">
                          <p>Please provide a clear portrait photo.</p>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest mt-6 block">Requirements</p>
                          <p className="text-white/40 text-xs">Max size: 5MB<br/>Formats: JPG, PNG, WebP</p>
                        </div>
                      </div>
                      {form.formState.errors.portraitFile && (
                        <p className="text-sm font-medium text-destructive mt-4">
                          {form.formState.errors.portraitFile.message as string}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="pt-8 border-t border-white/10 flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-14 px-10 bg-white text-black hover:bg-white/90 rounded-none font-bold uppercase tracking-widest text-sm"
                  data-testid="button-create-badge"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>{STAGE_MESSAGES[submitStage]}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Confirm Registration
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}

export default function Register() {
  const searchParams = new URLSearchParams(window.location.search);
  const isExistingBadge = searchParams.get("badge") === "true";

  if (isExistingBadge) {
    return <ExistingRegistrationBadge />;
  }
  return <RegistrationForm />;
}