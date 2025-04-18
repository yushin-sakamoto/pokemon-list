'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PokemonListResponse, PokemonSpecies, PokemonWithJapaneseName } from '@/types';
import { hiraganaToKatakana, katakanaToHiragana } from './utils/kana';

export default function Home() {
  const [pokemonList, setPokemonList] = useState<PokemonWithJapaneseName[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPokemonList() {
      try {
        // 最初の151匹のポケモンリストを取得
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        if (!response.ok) {
          throw new Error('Failed to fetch Pokemon list');
        }
        const data: PokemonListResponse = await response.json();

        // 各ポケモンの日本語名を取得
        const pokemonWithNames = await Promise.all(
          data.results.map(async (pokemon) => {
            const speciesResponse = await fetch(
              `https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`
            );
            const speciesData: PokemonSpecies = await speciesResponse.json();
            const japaneseName = speciesData.names.find(
              (name) => name.language.name === 'ja'
            )?.name || pokemon.name;

            return {
              ...pokemon,
              japaneseName,
            };
          })
        );

        setPokemonList(pokemonWithNames);
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
  const filteredPokemon = pokemonList.filter(pokemon => {
    const query = searchQuery.toLowerCase();
    const name = pokemon.name.toLowerCase();
    const japaneseName = pokemon.japaneseName;
    const hiraganaName = katakanaToHiragana(japaneseName);
    const katakanaName = hiraganaToKatakana(japaneseName);
    
    return name.includes(query) || 
           japaneseName.includes(searchQuery) ||
           hiraganaName.includes(searchQuery) ||
           katakanaName.includes(searchQuery);
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl">ポケモンデータを読み込み中...</p>
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
                  alt={pokemon.japaneseName}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{pokemon.japaneseName}</p>
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