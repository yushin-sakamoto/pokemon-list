'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PokemonListResponse } from '@/types';

export default function Home() {
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPokemonList() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        if (!response.ok) {
          throw new Error('Failed to fetch Pokemon list');
        }
        const data = await response.json();
        setPokemonList(data);
      } catch (error) {
        console.error('Error fetching Pokemon list:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonList();
  }, []);

  // ポケモンの画像URLを取得する関数
  const getPokemonImageUrl = (url: string): string => {
    const id = url.split('/').filter(Boolean).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  };

  // 検索クエリに基づいてポケモンをフィルタリングする関数
  const filteredPokemon = pokemonList?.results.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!pokemonList) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-600">Failed to load Pokemon list</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">ポケモン図鑑</h1>
      
      {/* 検索バー */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="ポケモンを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-gray-600 text-sm mt-2 text-center">
          {filteredPokemon.length} 匹のポケモンが見つかりました
        </p>
      </div>

      {/* ポケモン一覧 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPokemon.map((pokemon) => (
          <Link
            key={pokemon.name}
            href={`/pokemon/${pokemon.name}`}
            className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="aspect-square relative mb-2">
                <Image
                  src={getPokemonImageUrl(pokemon.url)}
                  alt={pokemon.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold capitalize">{pokemon.name}</p>
                <p className="text-gray-600">
                  #{pokemon.url.split('/').filter(Boolean).pop()?.padStart(3, '0')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 検索結果が0の場合のメッセージ */}
      {filteredPokemon.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-600">
            「{searchQuery}」に一致するポケモンは見つかりませんでした。
          </p>
        </div>
      )}
    </div>
  );
}