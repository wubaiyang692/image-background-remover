import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '背景去除工具 - 一键去除图片背景',
  description: '免费在线图片背景去除工具，支持 JPG、PNG、WebP，无需注册，打开即用',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
