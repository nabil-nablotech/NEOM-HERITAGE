// path: ./config/plugins.ts

export default {
  //
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 200,
      apolloServer: {
        tracing: false,
      },
    },
  },
  "import-export-entries": {
    enabled: true,
  },
};
