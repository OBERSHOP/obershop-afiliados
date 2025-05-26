"use client";

import { LoginForm } from "@/components/auth/LoginForm/LoginForm";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Link from "next/link";
import LoginBanner from "@/../public/image/banner-login.webp";
import Image from "next/image";
import Logo from "@/../public/logo.svg"

export default function LoginPage() {
  const ready = useRedirectIfAuthenticated();

  if (!ready) return <LoadingAnimation />;

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-primary">
      <div className="w-full flex items-center justify-center lg:w-1/3">
        <Card className="w-full max-w-md shadow-none border-none bg-primary">
          <Image src={Logo} alt="OBER shop" className="w-28 mx-auto mb-3" />
          <CardHeader>
            <CardTitle className="text-center text-2xl text-secondary">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:block w-2/3">
        <Link href="https://www.obershop.com.br" target="_blank" className="w-full">
          <Image
            src={LoginBanner}
            alt="Esqueceu a senha"
            className="w-full h-screen"
          />
        </Link>
      </div>
    </div>
  );
}
