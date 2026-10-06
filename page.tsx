'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Card = {
  id: string
  name: string
  card_number: string
  category: string
  image_url: string
  is_owned: boolean
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [filter, setFilter] = useState<'all' | 'owned' | 'missing'>('all')

  useEffect(() => {
    fetchCards()
  }, [])

  async function fetchCards() {
    const { data } = await supabase.from('cards').select('*').order('created_at', { ascending: true })
    if (data) setCards(data)
  }

  async function toggleOwned(id: string, currentStatus: boolean) {
    await supabase.from('cards').update({ is_owned: !currentStatus }).eq('id', id)
    fetchCards()
  }

  const filteredCards = cards.filter(card => {
    if (filter === 'owned') return card.is_owned
    if (filter === 'missing') return !card.is_owned
    return true
  })

  return (
    <main className="min-h-screen bg-pink-50 p-4">
      <h1 className="text-2xl font-bold text-center text-pink-600 mb-6">💖 アイカツ！カード管理 💖</h1>
      
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full font-bold ${filter === 'all' ? 'bg-pink-500 text-white' : 'bg-white text-pink-500'}`}>すべて</button>
        <button onClick={() => setFilter('owned')} className={`px-4 py-2 rounded-full font-bold ${filter === 'owned' ? 'bg-pink-500 text-white' : 'bg-white text-pink-500'}`}>持ってる</button>
        <button onClick={() => setFilter('missing')} className={`px-4 py-2 rounded-full font-bold ${filter === 'missing' ? 'bg-pink-500 text-white' : 'bg-white text-pink-500'}`}>持ってない</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <div key={card.id} className="bg-white rounded-xl p-3 shadow text-center border-2 border-pink-100 flex flex-col justify-between">
            <div>
              <img src={card.image_url || '/placeholder.png'} alt={card.name} className="w-full h-40 object-contain rounded mb-2" />
              <p className="text-xs text-gray-400">{card.card_number}</p>
              <h2 className="font-bold text-sm mb-2">{card.name}</h2>
            </div>
            <button
              onClick={() => toggleOwned(card.id, card.is_owned)}
              className={`w-full py-2 rounded-lg font-bold text-sm ${card.is_owned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {card.is_owned ? '持ってる！' : '持ってない'}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
