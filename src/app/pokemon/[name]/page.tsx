import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon, PokemonSpecies } from '@/types';

// params からポケモンの名前を取得
interface PokemonDetailPageProps {
  params: {
    name: string;
  };
}

async function fetchPokemonDetails(name: string): Promise<{ pokemon: Pokemon | null; japaneseName: string }> {
  try {
    const [pokemonResponse, speciesResponse] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`)
    ]);

    if (!pokemonResponse.ok || !speciesResponse.ok) {
      if (pokemonResponse.status === 404 || speciesResponse.status === 404) {
        return { pokemon: null, japaneseName: '' }; // ポケモンが見つからない場合
      }
      throw new Error(`Failed to fetch data for ${name}`);
    }

    const [pokemonData, speciesData]: [Pokemon, PokemonSpecies] = await Promise.all([
      pokemonResponse.json(),
      speciesResponse.json()
    ]);

    const japaneseName = speciesData.names.find(
      (nameData) => nameData.language.name === 'ja'
    )?.name || name;

    return { pokemon: pokemonData, japaneseName };
  } catch (error) {
    console.error("Error fetching Pokemon details:", error);
    return { pokemon: null, japaneseName: '' };
  }
}

// 画像URL取得関数
const getPokemonImageUrl = (pokemonDetails: Pokemon | undefined | null): string => {
  if (!pokemonDetails) return '/placeholder.png';
  return pokemonDetails.sprites?.other?.['official-artwork']?.front_default || pokemonDetails.sprites?.front_default || '/placeholder.png';
};

// タイプの日本語名を取得
const getJapaneseTypeName = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    normal: 'ノーマル',
    fire: 'ほのお',
    water: 'みず',
    electric: 'でんき',
    grass: 'くさ',
    ice: 'こおり',
    fighting: 'かくとう',
    poison: 'どく',
    ground: 'じめん',
    flying: 'ひこう',
    psychic: 'エスパー',
    bug: 'むし',
    rock: 'いわ',
    ghost: 'ゴースト',
    dragon: 'ドラゴン',
    dark: 'あく',
    steel: 'はがね',
    fairy: 'フェアリー'
  };
  return typeMap[type] || type;
};

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { pokemon, japaneseName } = await fetchPokemonDetails(params.name);

  if (!pokemon) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gray-100 p-6 text-center">
          <Image
            src={getPokemonImageUrl(pokemon)}
            alt={japaneseName}
            width={200}
            height={200}
            className="mx-auto mb-4"
            unoptimized
          />
          <h1 className="text-4xl font-bold mb-2">{japaneseName}</h1>
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
                    <span key={typeInfo.slot} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      {getJapaneseTypeName(typeInfo.type.name)}
                    </span>
                  ))}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium text-gray-700">特性</td>
                <td className="py-2 px-4 text-gray-600">
                  {pokemon.abilities.map(abilityInfo => (
                    <span key={abilityInfo.slot} className="block">
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
                      <li key={statInfo.stat.name} className="flex justify-between">
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