import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon, PokemonListResponse } from '@/types';

// params からポケモンの名前を取得
interface PokemonDetailPageProps {
  params: {
    name: string;
  };
}

async function fetchPokemonDetails(name: string): Promise<Pokemon | null> {
  // nameが文字列でない場合はnullを返す
  if (typeof name !== 'string' || !name) {
    console.error("Invalid Pokemon name provided:", name);
    return null;
  }

  try {
    // nameが文字列であることが保証されているため、toLowerCase()を安全に使用できる
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // ポケモンが見つからない場合はnullを返す
      }
      throw new Error(`Failed to fetch data for ${name}, status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching Pokemon details:", error);
    return null; // エラー時もnullを返す
  }
}

// 画像URL取得関数（一覧ページと同じロジック）
const getPokemonImageUrl = (pokemonDetails: Pokemon | undefined | null): string => {
    if (!pokemonDetails) return '/placeholder.png'; // データがない場合
    return pokemonDetails.sprites?.other?.['official-artwork']?.front_default || pokemonDetails.sprites?.front_default || '/placeholder.png';
};

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const pokemon = await fetchPokemonDetails(params.name);

  if (!pokemon) {
    notFound(); // ポケモンが見つからない場合は404ページを表示
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gray-100 p-6 text-center">
            <Image
              src={getPokemonImageUrl(pokemon)}
              alt={pokemon.name}
              width={200}
              height={200}
              className="mx-auto mb-4"
              unoptimized // 外部ドメインの画像
            />
            <h1 className="text-4xl font-bold capitalize mb-2">{pokemon.name}</h1>
            <p className="text-gray-600">図鑑番号: #{pokemon.id}</p>
        </div>

        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">詳細情報</h2>
            <table className="w-full border-collapse">
                <tbody>
                    <tr className="border-b">
                        <td className="py-2 px-4 font-medium text-gray-700">高さ</td>
                        <td className="py-2 px-4 text-gray-600">{(pokemon.height / 10).toFixed(1)} m</td>
                    </tr>
                    <tr className="border-b">
                        <td className="py-2 px-4 font-medium text-gray-700">重さ</td>
                        <td className="py-2 px-4 text-gray-600">{(pokemon.weight / 10).toFixed(1)} kg</td>
                    </tr>
                    <tr className="border-b">
                        <td className="py-2 px-4 font-medium text-gray-700">タイプ</td>
                        <td className="py-2 px-4 text-gray-600">
                            {pokemon.types.map(typeInfo => (
                                <span key={typeInfo.slot} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 capitalize">
                                    {typeInfo.type.name}
                                </span>
                            ))}
                        </td>
                    </tr>
                    <tr className="border-b">
                        <td className="py-2 px-4 font-medium text-gray-700">特性</td>
                        <td className="py-2 px-4 text-gray-600">
                            {pokemon.abilities.map(abilityInfo => (
                                <span key={abilityInfo.slot} className="block capitalize">
                                    {abilityInfo.ability.name} {abilityInfo.is_hidden ? '(隠れ特性)' : ''}
                                </span>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td className="py-2 px-4 font-medium text-gray-700 align-top">種族値</td>
                        <td className="py-2 px-4 text-gray-600">
                            <ul>
                                {pokemon.stats.map(statInfo => (
                                    <li key={statInfo.stat.name} className="capitalize flex justify-between">
                                        <span>{statInfo.stat.name.replace('special-attack', 'とくこう').replace('special-defense', 'とくぼう').replace('hp', 'HP').replace('attack', 'こうげき').replace('defense', 'ぼうぎょ').replace('speed', 'すばやさ')}:</span>
                                        <span>{statInfo.base_stat}</span>
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-8 text-center">
                <Link href="/">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200 ease-in-out">
                        一覧に戻る
                    </button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}

// 静的パスを生成（ビルド時に各ポケモンのページを生成）
export async function generateStaticParams() {
    const data: PokemonListResponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151").then(res => res.json());
    return data.results.map(pokemon => ({
      name: pokemon.name,
    }));
}