import './globals.css';

export const metadata = {
  title: 'アイカツカードリスト',
  description: 'アイカツカードの所持状況を管理するアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
