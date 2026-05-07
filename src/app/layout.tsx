import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Administrador Dos Puntos Turismo",
  description: "Panel para gestionar el contenido del sitio web de Dos Puntos Turismo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
