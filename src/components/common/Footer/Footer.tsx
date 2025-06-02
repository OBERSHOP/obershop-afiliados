'use client';

import Logo from '@/../public/logo.svg';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-sidebar-primary text-white py-10 px-6 flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
      <div className="flex justify-center lg:justify-start">
        <Link href="/home">
          <Image className="w-36" src={Logo} alt="OBER shop" />
        </Link>
      </div>

      <div className="text-center lg:text-left">
        <h2 className="text-lg font-semibold mb-3">Redes Sociais</h2>
        <div className="flex justify-center lg:justify-start gap-6">
          <Link href="https://www.facebook.com/ObershopOficial/">
            <Facebook className="w-6 h-6 text-white hover:text-gray-300 transition" />
          </Link>
          <Link href="https://www.instagram.com/obershopoficial/">
            <Instagram className="w-6 h-6 text-white hover:text-gray-300 transition" />
          </Link>
          <Link href="https://www.tiktok.com/@obershopoficial">
            <svg
              className="w-6 h-6 fill-white hover:fill-gray-300 transition"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
            </svg>{' '}
          </Link>
          <Link href="https://www.youtube.com/channel/UCFhYa-2_TfgVw2BFFLfLtvA">
            <Youtube className="w-6 h-6 text-white hover:text-gray-300 transition" />
          </Link>
        </div>
      </div>

      {/* Contato */}
      <div className="text-center lg:text-left space-y-2">
        <h2 className="text-lg font-semibold mb-3">Atendimento</h2>
        <Link
          className="block hover:underline"
          href="https://wa.me/5519983052559"
        >
          +55 (19) 98305-2559
        </Link>
        <Link
          className="block hover:underline"
          href="mailto:atendimento@obershop.com.br"
        >
          atendimento@obershop.com.br
        </Link>
        <Link
          className="block text-sm text-gray-400 hover:underline"
          href="https://www.google.com/maps/place/Ober+Shop/@-22.7693113,-47.3158032,15z"
        >
          Av. Industrial Oscar Berggren, 501 - Fundos - Anexo Salão 01 - Nova
          Odessa - SP
        </Link>
      </div>
    </footer>
  );
}
