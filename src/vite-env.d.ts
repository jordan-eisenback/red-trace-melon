/// <reference types="vite/client" />

// Allow importing CSV files as raw strings via Vite's ?raw query
declare module "*.csv?raw" {
  const content: string;
  export default content;
}

// Allow importing CSV files as assets (URL)
declare module "*.csv" {
  const src: string;
  export default src;
}
