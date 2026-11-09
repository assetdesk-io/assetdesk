"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      // Best-effort POST — backend may not implement this yet, but the UI is ready
      await api.post("/auth/forgot-password", { email: values.email });
    } catch {
      // Swallow errors: don't reveal whether the email exists
    }
    setSubmittedEmail(values.email);
    setSent(true);
  };

  if (sent) {
    return (
      <>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircle size={22} className="text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">
          Check your email
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          If <strong>{submittedEmail}</strong> is registered, you&apos;ll receive
          a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-gray-900 hover:underline"
        >
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Reset your password
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
        >
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
