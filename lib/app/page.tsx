'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Check, Trash2, Image as ImageIcon } from 'lucide-react';

type Card = {
  id: string;
  card_number: string;
  name: string;
  brand: string;
  type: string;
  rarity: string;
  front_image_url: string;
  back_image_url: string;
  is_owned: boolean;
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('Cute');
  const [rarity, setRarity] = useState('N');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setCards(data || []);
    setLoading(false);
  };

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    const { error } = await supabase.storage.from('card-images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('card-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let frontUrl = '';
      let backUrl = '';

      if (frontImage) frontUrl = await uploadImage(frontImage, 'fronts');
      if (backImage) backUrl = await uploadImage(backImage, 'backs');

      const { error } = await supabase.from('cards').insert([
        {
          card_number: cardNumber,
          name,
          brand,
          type,
          rarity,
          front_image_url: frontUrl,
          back_image_url: backUrl,
          is_owned: false,
        },
      ]);

      if (error) throw error;

      setCardNumber('');
      setName('');
      setBrand('');
      setFrontImage(null);
      setBackImage(null);
      fetchCards();
    } catch (err) {
      alert('カードの登録に失敗しました');
      console.error(err);
    }
  };

  const toggleOwned = async (id: string, currentOwned: boolean) => {
    const { error } = await supabase.from('cards').update({ is_owned: !currentOwned }).eq('id', id);
    if (error) console.error(error);
    else fetchCards();
  };

  const deleteCard = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) console.error(error);
    else fetchCards();
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-pink-600 text-center mb-6">アイカツカードリスト</h1>

      {/* 登録フォーム */}
      <form onSubmit={handleAddCard} className="bg-white p-4 rounded-xl shadow-md mb-6 space-y-3">
        <h2 className="font-bold text-gray-700 text-lg border-b pb-2">カードを追加</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="型番 (例: 14 01-01)"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="p-2 border rounded-lg w-full text-sm"
            required
          />
          <input
            type="text"
            placeholder="カード名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded-lg w-full text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="ブランド"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="p-2 border rounded-lg w-full text-sm"
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded-lg text-sm">
            <option value="Cute">Cute</option>
            <option value="Cool">Cool</option>
            <option value="Sexy">Sexy</option>
            <option value="Pop">Pop</option>
          </select>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="p-2 border rounded-lg text-sm">
            <option value="N">N</option>
            <option value="R">R</option>
            <option value="PR">PR</option>
            <option value="CP">CP</option>
          </select>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <label className="block mb-1">表面画像:</label>
            <input type="file" accept="image/*" onChange={(e) => setFrontImage(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="block mb-1">裏面画像:</label>
            <input type="file" accept="image/*" onChange={(e) => setBackImage(e.target.files?.[0] || null)} />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 shadow"
        >
          <Plus size={18} /> カードを追加する
        </button>
      </form>

      {/* カード一覧 */}
      {loading ? (
        <p className="text-center text-gray-500">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`p-3 rounded-xl shadow border bg-white flex items-center gap-3 transition ${
                card.is_owned ? 'border-pink-300 bg-pink-50/30' : 'border-gray-200 opacity-80'
              }`}
            >
              <button
                onClick={() => toggleOwned(card.id, card.is_owned)}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                  card.is_owned ? 'bg-pink-500 text-white border-pink-500' : 'bg-white border-gray-300'
                }`}
              >
                {card.is_owned && <Check size={16} />}
              </button>

              <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden relative flex-shrink-0 border">
                {card.front_image_url ? (
                  <img src={card.front_image_url} alt={card.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-pink-500 font-semibold">{card.card_number}</div>
                <div className="font-bold text-gray-800 text-sm truncate">{card.name}</div>
                <div className="text-xs text-gray-500">
                  {card.type} / {card.rarity} {card.brand && `• ${card.brand}`}
                </div>
              </div>

              <button onClick={() => deleteCard(card.id)} className="text-gray-400 hover:text-red-500 p-1">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
