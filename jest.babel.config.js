module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic', // Use new JSX transform (no React import needed)
      },
    ],
  ],
};
