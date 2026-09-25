import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    // Vendored React Bits sources are kept as close to the registry as possible.
    // They predate the React Compiler lint rules; behaviour is correct at runtime.
    files: [
      'src/components/effects/{DitherVeil,GlowCursor}/**',
      'src/components/navigation/GooeyNav/**',
      'src/components/typography/SplitFlapText/**',
      'src/components/micro/SlingButton/**',
      'src/components/micro/PaperCrumple/**',
      'src/components/cards/ProfileCard/**',
    ],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
  { ignores: ['.next/**', 'node_modules/**'] },
];

export default config;
