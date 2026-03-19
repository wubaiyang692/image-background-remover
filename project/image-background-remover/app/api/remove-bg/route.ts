import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 });
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '图片大小不能超过 10MB' }, { status: 400 });
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '服务配置错误，请联系管理员' }, { status: 500 });
    }

    const bgFormData = new FormData();
    bgFormData.append('image_file', image);
    bgFormData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: bgFormData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = (err as any)?.errors?.[0]?.title || '背景去除失败，请重试';
      return NextResponse.json({ error: msg }, { status: response.status });
    }

    const resultBuffer = await response.arrayBuffer();
    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: '服务器错误，请重试' }, { status: 500 });
  }
}
