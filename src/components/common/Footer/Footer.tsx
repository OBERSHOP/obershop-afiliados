"use client";

import Logo from "@/../public/logo.svg";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-sidebar-primary text-white py-10 px-6 flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
      {/* Logo */}
      <div className="flex justify-center lg:justify-start">
        <Link href="/home">
          <Image className="w-36" src={Logo} alt="OBER shop" />
        </Link>
      </div>

      {/* Redes Sociais */}
      <div className="text-center lg:text-left">
        <h2 className="text-lg font-semibold mb-3">Redes Sociais</h2>
        <div className="flex justify-center lg:justify-start gap-6">
          <Link href="https://www.facebook.com/ObershopOficial/">
            <svg className="w-6 h-6 fill-white hover:fill-blue-500 transition" viewBox="0 0 448 512">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9...z" />
            </svg>
          </Link>
          <Link href="https://www.instagram.com/obershopoficial/">
            <svg className="w-6 h-6 fill-white hover:fill-pink-500 transition" viewBox="0 0 448 512">
              <path d="M64 32C28.7 32 0 60.7 0 96V416..." />
            </svg>
          </Link>
          <Link href="https://www.tiktok.com/@obershopoficial">
            <svg className="w-6 h-6 fill-white hover:fill-black transition" viewBox="0 0 448 512">
              <path d="M448 209.9a210.1 210.1 0 0 1 -122..." />
            </svg>
          </Link>
          <Link href="https://www.youtube.com/channel/UCFhYa-2_TfgVw2BFFLfLtvA">
            <svg className="w-6 h-6 fill-white hover:fill-red-600 transition" viewBox="0 0 576 512">
              <path d="M549.7 124.1c-6.3-23.7-24.8-42..." />
            </svg>
          </Link>
        </div>
      </div>

      {/* Contato */}
      <div className="text-center lg:text-left space-y-2">
        <h2 className="text-lg font-semibold mb-3">Atendimento</h2>
        <Link className="block hover:underline" href="https://wa.me/5519983052559">
          +55 (19) 98305-2559
        </Link>
        <Link className="block hover:underline" href="mailto:atendimento@obershop.com.br">
          atendimento@obershop.com.br
        </Link>
        <Link
          className="block text-sm text-gray-400 hover:underline"
          href="https://www.google.com/maps/place/Ober+Shop/@-22.7693113,-47.3158032,15z"
        >
          Av. Industrial Oscar Berggren, 501 - Fundos - Anexo Salão 01 - Nova Odessa - SP
        </Link>
      </div>
    </footer>
  );
}
